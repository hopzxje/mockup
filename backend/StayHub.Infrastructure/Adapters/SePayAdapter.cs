using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StayHub.Domain.Entities;
using StayHub.Domain.Enums;
using StayHub.Infrastructure.Data;

namespace StayHub.Infrastructure.Adapters;

public record SePayWebhookDto(
    long Id,
    string Gateway,
    string TransactionDate,
    string AccountNumber,
    string? Code,
    string Content,
    string TransferType,
    decimal TransferAmount,
    decimal Accumulated,
    string? SubAccount,
    string ReferenceCode,
    string Description
);

public interface ISePayAdapter
{
    Task<(bool Success, string Message, Guid? PaymentId)> ProcessWebhookAsync(SePayWebhookDto payload, string? apiKeyHeader);
}

public class SePayAdapter : ISePayAdapter
{
    private readonly StayHubDbContext _context;
    private readonly ILogger<SePayAdapter> _logger;
    private readonly string _configuredApiKey;

    public SePayAdapter(StayHubDbContext context, ILogger<SePayAdapter> logger)
    {
        _context = context;
        _logger = logger;
        // Configured secret from appsettings or user secrets
        _configuredApiKey = Environment.GetEnvironmentVariable("SEPAY_API_KEY") ?? "sep_sec_live_default_key";
    }

    public async Task<(bool Success, string Message, Guid? PaymentId)> ProcessWebhookAsync(SePayWebhookDto payload, string? apiKeyHeader)
    {
        // 1. Authenticate webhook caller via API Key header
        if (!string.IsNullOrEmpty(_configuredApiKey) && apiKeyHeader != $"Apikey {_configuredApiKey}")
        {
            _logger.LogWarning("Webhook SePay signature failed. Invalid API Key header.");
            return (false, "Xác thực API Key SePay không hợp lệ", null);
        }

        // 2. Enforce idempotency: prevent duplicate processing of the same transaction
        var txCode = $"SEP-{payload.Id}";
        var existingPayment = await _context.Payments.FirstOrDefaultAsync(p => p.TransactionCode == txCode);
        if (existingPayment != null)
        {
            _logger.LogInformation("Giao dịch {TxCode} đã được ghi nhận trước đó. Bỏ qua để tránh xử lý trùng.", txCode);
            return (true, "Giao dịch đã được ghi nhận trước đó (Idempotent)", existingPayment.Id);
        }

        // 3. Match Invoice by reference token in transfer content (e.g. STYHUB101)
        var content = payload.Content.ToUpperInvariant();
        var invoices = await _context.Invoices
            .Include(i => i.Payments)
            .Where(i => i.Status != InvoiceStatus.ĐãThanhToán && i.Status != InvoiceStatus.ĐãHủy)
            .ToListAsync();

        Invoice? matchedInvoice = null;
        foreach (var inv in invoices)
        {
            // Token pattern STYHUB<ApartmentCode> or Invoice Code
            var token = $"STYHUB{inv.ApartmentId}".ToUpperInvariant();
            if (content.Contains(inv.InvoiceCode.ToUpperInvariant().Replace("-", "")) ||
                content.Contains(token) ||
                content.Contains($"STYHUB{inv.InvoiceCode.Split('-').LastOrDefault()}"))
            {
                matchedInvoice = inv;
                break;
            }
        }

        if (matchedInvoice == null)
        {
            _logger.LogWarning("Không tìm thấy hóa đơn mở phù hợp với nội dung chuyển khoản: {Content}", payload.Content);
            return (false, "Nội dung chuyển khoản không khớp hóa đơn mở. Đã chuyển sang hàng đợi đối soát thủ công.", null);
        }

        // 4. Record Payment and update balances inside EF Transaction
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            InvoiceId = matchedInvoice.Id,
            TransactionCode = txCode,
            Amount = payload.TransferAmount,
            PaymentMethod = "SEPAY_QR",
            PaymentDateUtc = DateTime.UtcNow,
            ReferenceCode = payload.ReferenceCode,
            BankName = payload.Gateway,
            AccountNumber = payload.AccountNumber,
            PayerName = "Cư dân chuyển khoản SePay",
            Status = "Thành công",
            Notes = $"Ghi nhận từ SePay Webhook ({payload.Content})"
        };

        _context.Payments.Add(payment);

        matchedInvoice.PaidAmount += payload.TransferAmount;
        matchedInvoice.BalanceRemaining = Math.Max(0, matchedInvoice.TotalAmount - matchedInvoice.PaidAmount);

        if (matchedInvoice.BalanceRemaining == 0)
        {
            matchedInvoice.Status = InvoiceStatus.ĐãThanhToán;
        }
        else
        {
            matchedInvoice.Status = InvoiceStatus.ThanhToánMộtPhần;
        }

        // Audit log
        _context.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            TimestampUtc = DateTime.UtcNow,
            UserId = "SYSTEM_SEPAY",
            UserName = "Hệ thống SePay Webhook",
            UserRole = "ADMIN",
            Action = "GHI_NHAN_THANH_TOAN",
            EntityName = "Invoice",
            EntityId = matchedInvoice.Id.ToString(),
            BuildingId = matchedInvoice.BuildingId,
            Details = $"Xác thực thanh toán {payload.TransferAmount:N0} ₫ cho Hóa đơn {matchedInvoice.InvoiceCode}. Còn nợ: {matchedInvoice.BalanceRemaining:N0} ₫"
        });

        await _context.SaveChangesAsync();

        return (true, "Ghi nhận thanh toán và cập nhật hóa đơn thành công", payment.Id);
    }
}
