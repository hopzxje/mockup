using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace StayHub.Infrastructure.Adapters;

public record ZnsRequestDto(
    string Phone,
    string TemplateId,
    Dictionary<string, string> TemplateData
);

public record ZnsResponseDto(
    int Error,
    string Message,
    Dictionary<string, object>? Data
);

public interface IZaloZnsAdapter
{
    Task<(bool Success, string Message)> SendZnsAsync(ZnsRequestDto request);
}

public class ZaloZnsAdapter : IZaloZnsAdapter
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ZaloZnsAdapter> _logger;
    private readonly string _accessToken;

    public ZaloZnsAdapter(HttpClient httpClient, ILogger<ZaloZnsAdapter> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _accessToken = Environment.GetEnvironmentVariable("ZALO_OA_ACCESS_TOKEN") ?? "zalo_access_token_placeholder";
    }

    public async Task<(bool Success, string Message)> SendZnsAsync(ZnsRequestDto request)
    {
        // If placeholder, simulate delivery according to spec
        if (_accessToken.Contains("placeholder"))
        {
            _logger.LogInformation("Mô phỏng gửi tin nhắn Zalo ZNS thành công tới SĐT {Phone} với mẫu {TemplateId}", request.Phone, request.TemplateId);
            return (true, "Đã gửi tin nhắn Zalo ZNS (Mô phỏng phát triển)");
        }

        try
        {
            var url = "https://business.openapi.zalo.me/message/template";
            var body = new
            {
                phone = request.Phone.StartsWith("0") ? "84" + request.Phone.Substring(1) : request.Phone,
                template_id = request.TemplateId,
                template_data = request.TemplateData,
                tracking_id = Guid.NewGuid().ToString()
            };

            using var req = new HttpRequestMessage(HttpMethod.Post, url);
            req.Headers.Add("access_token", _accessToken);
            req.Content = new StringContent(JsonSerializer.Serialize(body), System.Text.Encoding.UTF8, "application/json");

            var res = await _httpClient.SendAsync(req);
            var content = await res.Content.ReadAsStringAsync();

            var znsRes = JsonSerializer.Deserialize<ZnsResponseDto>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (znsRes?.Error == 0)
            {
                return (true, "Gửi Zalo ZNS thành công");
            }

            _logger.LogError("Gửi Zalo ZNS thất bại: {Error} - {Message}", znsRes?.Error, znsRes?.Message);
            return (false, znsRes?.Message ?? "Lỗi gửi Zalo ZNS");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ngoại lệ khi gọi Zalo ZNS API");
            return (false, ex.Message);
        }
    }
}
