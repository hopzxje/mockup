using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayHub.Domain.Entities;
using StayHub.Domain.Enums;
using StayHub.Infrastructure.Data;

namespace StayHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BuildingsController : ControllerBase
{
    private readonly StayHubDbContext _context;

    public BuildingsController(StayHubDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBuildings()
    {
        var buildings = await _context.Buildings
            .Include(b => b.Apartments)
            .OrderBy(b => b.Code)
            .ToListAsync();

        return Ok(buildings);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetBuildingById(Guid id)
    {
        var building = await _context.Buildings
            .Include(b => b.Apartments)
            .Include(b => b.Fees)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (building == null) return NotFound(new { message = "Không tìm thấy cơ sở" });
        return Ok(building);
    }

    public record BatchGenerateRoomsDto(
        int TotalFloors,
        int RoomsPerFloor,
        int StartFloor,
        decimal ReferencePrice,
        decimal AreaSqm
    );

    [HttpPost("{id:guid}/batch-generate-rooms")]
    public async Task<IActionResult> BatchGenerateRooms(Guid id, [FromBody] BatchGenerateRoomsDto dto)
    {
        var building = await _context.Buildings
            .Include(b => b.Apartments)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (building == null) return NotFound(new { message = "Không tìm thấy cơ sở" });

        var assetTypes = await _context.AssetTypes.ToListAsync();
        var newApartments = new List<Apartment>();
        var newAssets = new List<Asset>();

        // Transactional boundary
        using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            for (int f = dto.StartFloor; f < dto.StartFloor + dto.TotalFloors; f++)
            {
                for (int r = 1; r <= dto.RoomsPerFloor; r++)
                {
                    var roomCode = $"{f}0{r}";
                    if (building.Apartments.Any(a => a.RoomCode == roomCode) || newApartments.Any(a => a.RoomCode == roomCode))
                    {
                        return BadRequest(new { message = $"Mã phòng {roomCode} đã tồn tại trong cơ sở. Hủy thao tác để tránh trùng lặp." });
                    }

                    var apt = new Apartment
                    {
                        Id = Guid.NewGuid(),
                        BuildingId = building.Id,
                        RoomCode = roomCode,
                        Floor = f,
                        AreaSqm = dto.AreaSqm,
                        ReferencePrice = dto.ReferencePrice,
                        CurrentPrice = dto.ReferencePrice,
                        Status = ApartmentStatus.Trống,
                        Description = $"Phòng {roomCode} tầng {f}, sinh tự động."
                    };
                    newApartments.Add(apt);

                    foreach (var at in assetTypes)
                    {
                        newAssets.Add(new Asset
                        {
                            Id = Guid.NewGuid(),
                            ApartmentId = apt.Id,
                            AssetTypeId = at.Id,
                            Name = $"{at.Name} - P.{roomCode}",
                            Code = $"{building.Code}-{roomCode}-{at.Code}",
                            SerialNumber = $"SN-{roomCode}-{Random.Shared.Next(1000, 9999)}",
                            Condition = AssetCondition.Tốt,
                            InstalledDate = DateTime.UtcNow,
                            LastCheckedAtUtc = DateTime.UtcNow,
                            LastUpdatedBy = User.Identity?.Name ?? "Admin"
                        });
                    }
                }
            }

            _context.Apartments.AddRange(newApartments);
            _context.Assets.AddRange(newAssets);

            building.TotalRooms += newApartments.Count;
            building.TotalFloors = Math.Max(building.TotalFloors, dto.StartFloor + dto.TotalFloors - 1);

            _context.AuditLogs.Add(new AuditLog
            {
                Id = Guid.NewGuid(),
                TimestampUtc = DateTime.UtcNow,
                UserId = "ADMIN",
                UserName = User.Identity?.Name ?? "Quản trị viên",
                UserRole = "ADMIN",
                Action = "SINH_PHONG_HANG_LOAT",
                EntityName = "Building",
                EntityId = building.Id.ToString(),
                BuildingId = building.Id,
                Details = $"Sinh hàng loạt {newApartments.Count} phòng và {newAssets.Count} tài sản tại {building.Name}"
            });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(new
            {
                message = $"Đã sinh thành công {newApartments.Count} phòng và {newAssets.Count} tài sản",
                roomsCount = newApartments.Count,
                assetsCount = newAssets.Count
            });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, new { message = "Lỗi khi sinh phòng hàng loạt", error = ex.Message });
        }
    }
}
