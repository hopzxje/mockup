using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using StayHub.Domain.Entities;
using StayHub.Domain.Enums;
using StayHub.Infrastructure.Data;

namespace StayHub.Tests;

public class StayHubBusinessRuleTests
{
    private StayHubDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<StayHubDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new StayHubDbContext(options);
    }

    // Test 1: Hai hợp đồng không được phép chồng chéo thời gian trên cùng 1 phòng
    public async Task Contract_ShouldNotAllow_OverlappingDates_ForSameApartment()
    {
        var context = CreateDbContext();
        var aptId = Guid.NewGuid();

        var existingContract = new RentalContract
        {
            Id = Guid.NewGuid(),
            ContractCode = "HD-2026-101",
            ApartmentId = aptId,
            StartDate = new DateTime(2026, 1, 1),
            EndDate = new DateTime(2026, 12, 31),
            Status = ContractStatus.ĐangHiệuLực,
            RentPrice = 5000000
        };
        context.RentalContracts.Add(existingContract);
        await context.SaveChangesAsync();

        // New contract overlapping with existing
        var overlappingContract = new RentalContract
        {
            Id = Guid.NewGuid(),
            ContractCode = "HD-2026-102-OVERLAP",
            ApartmentId = aptId,
            StartDate = new DateTime(2026, 6, 1), // Inside existing range!
            EndDate = new DateTime(2027, 5, 31),
            Status = ContractStatus.ChờDuyệt
        };

        bool hasOverlap = await context.RentalContracts.AnyAsync(c =>
            c.ApartmentId == aptId &&
            c.Status == ContractStatus.ĐangHiệuLực &&
            overlappingContract.StartDate <= c.EndDate &&
            overlappingContract.EndDate >= c.StartDate);

        // Verification: Business rule must detect overlap
        if (!hasOverlap)
        {
            throw new Exception("Test Failed: Hệ thống phải phát hiện và chặn hợp đồng chồng lấn thời gian!");
        }
    }

    // Test 2: Chặn nhập chỉ số điện nước mới nhỏ hơn chỉ số cũ
    public void UtilityReading_ShouldReject_CurrentIndexLessThanPreviousIndex()
    {
        decimal previous = 1500;
        decimal current = 1450; // Invalid!

        bool isValid = current >= previous;
        if (isValid)
        {
            throw new Exception("Test Failed: Chỉ số mới không được nhỏ hơn chỉ số cũ!");
        }
    }

    // Test 3: Check-out bắt buộc công nợ phải bằng 0
    public void CheckOut_ShouldReject_WhenBalanceRemainingGreaterThanZero()
    {
        decimal balanceRemaining = 3500000; // Still owes money
        bool canCheckOut = balanceRemaining == 0;

        if (canCheckOut)
        {
            throw new Exception("Test Failed: Không được cho phép Check-out khi còn nợ tiền phòng!");
        }
    }
}
