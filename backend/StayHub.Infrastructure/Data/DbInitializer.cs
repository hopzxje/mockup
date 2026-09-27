using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StayHub.Domain.Entities;
using StayHub.Domain.Enums;

namespace StayHub.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(
        StayHubDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager)
    {
        // Apply pending migrations if available
        if (context.Database.IsRelational())
        {
            await context.Database.MigrateAsync();
        }

        // 1. Seed Roles
        string[] roles = { "ADMIN", "MANAGER", "STAFF", "RESIDENT" };
        foreach (var r in roles)
        {
            if (!await roleManager.RoleExistsAsync(r))
            {
                await roleManager.CreateAsync(new ApplicationRole { Name = r });
            }
        }

        // 2. Seed Users
        if (!context.Users.Any())
        {
            var adminUser = new ApplicationUser
            {
                UserName = "admin@stayhub.vn",
                Email = "admin@stayhub.vn",
                FullName = "Nguyễn Hoàng Nam",
                PhoneNumber = "0908889999",
                Role = UserRole.ADMIN,
                EmailConfirmed = true,
                IsActive = true
            };
            await userManager.CreateAsync(adminUser, "Admin@123");
            await userManager.AddToRoleAsync(adminUser, "ADMIN");

            var manager1 = new ApplicationUser
            {
                UserName = "manager1@stayhub.vn",
                Email = "manager1@stayhub.vn",
                FullName = "Trần Minh Đức",
                PhoneNumber = "0912345678",
                Role = UserRole.MANAGER,
                EmailConfirmed = true,
                IsActive = true
            };
            await userManager.CreateAsync(manager1, "Manager@123");
            await userManager.AddToRoleAsync(manager1, "MANAGER");

            var staff1 = new ApplicationUser
            {
                UserName = "staff1@stayhub.vn",
                Email = "staff1@stayhub.vn",
                FullName = "Phạm Tuấn Anh",
                PhoneNumber = "0933112233",
                Role = UserRole.STAFF,
                EmailConfirmed = true,
                IsActive = true
            };
            await userManager.CreateAsync(staff1, "Staff@123");
            await userManager.AddToRoleAsync(staff1, "STAFF");

            var resident1 = new ApplicationUser
            {
                UserName = "resident1@gmail.com",
                Email = "resident1@gmail.com",
                FullName = "Lê Thị Thu Thảo",
                PhoneNumber = "0987654321",
                Role = UserRole.RESIDENT,
                EmailConfirmed = true,
                IsActive = true
            };
            await userManager.CreateAsync(resident1, "Resident@123");
            await userManager.AddToRoleAsync(resident1, "RESIDENT");
        }

        // 3. Seed Asset Types
        if (!context.AssetTypes.Any())
        {
            var assetTypes = new List<AssetType>
            {
                new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Code = "AC", Name = "Điều hòa Inverter", DefaultLifeMonths = 60, Unit = "Cái", Description = "Điều hòa tiết kiệm điện Daikin / Panasonic 1.5 HP" },
                new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Code = "FRIDGE", Name = "Tủ lạnh 180L", DefaultLifeMonths = 72, Unit = "Cái", Description = "Tủ lạnh 2 cánh Toshiba không đóng tuyết" },
                new() { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Code = "WATER_HEATER", Name = "Bình nóng lạnh 30L", DefaultLifeMonths = 48, Unit = "Cái", Description = "Bình nóng lạnh Ariston chống giật ELCB" },
                new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Code = "BED", Name = "Giường nệm cao su 1m6x2m", DefaultLifeMonths = 84, Unit = "Bộ", Description = "Khung giường gỗ sồi kèm nệm cao su non" },
                new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), Code = "WARDROBE", Name = "Tủ quần áo 2 cánh", DefaultLifeMonths = 60, Unit = "Cái", Description = "Tủ gỗ công nghiệp MDF chống ẩm" },
                new() { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), Code = "DESK_CHAIR", Name = "Bàn ghế làm việc", DefaultLifeMonths = 36, Unit = "Bộ", Description = "Bàn làm việc 1m2 kèm ghế xoay công thái học" }
            };
            await context.AssetTypes.AddRangeAsync(assetTypes);
            await context.SaveChangesAsync();
        }

        // 4. Seed 3 Buildings & 36 Apartments & Predefined Assets
        if (!context.Buildings.Any())
        {
            var b1 = new Building
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                Code = "SH-CENTRAL",
                Name = "StayHub Central - Quận 1",
                Address = "95 Pasteur, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
                TotalFloors = 3,
                TotalRooms = 12,
                ManagerName = "Trần Minh Đức",
                Description = "Cơ sở trung tâm gần phố đi bộ, ngân hàng và khu văn phòng cao cấp."
            };

            var b2 = new Building
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                Code = "SH-LANDMARK",
                Name = "StayHub Landmark - Bình Thạnh",
                Address = "42 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
                TotalFloors = 3,
                TotalRooms = 12,
                ManagerName = "Trần Minh Đức",
                Description = "Cơ sở liền kề Landmark 81, view sông thoáng đãng và tiện ích đầy đủ."
            };

            var b3 = new Building
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                Code = "SH-WESTLAKE",
                Name = "StayHub Westlake - Tây Hồ",
                Address = "18 Quảng Khánh, Phường Quảng An, Quận Tây Hồ, Hà Nội",
                TotalFloors = 3,
                TotalRooms = 12,
                ManagerName = "Lê Hải Yến",
                Description = "Cơ sở Hồ Tây không gian yên tĩnh, ban công ngắm hồ thoáng mát."
            };

            await context.Buildings.AddRangeAsync(b1, b2, b3);
            await context.SaveChangesAsync();

            // Predefined asset types
            var allAssetTypes = await context.AssetTypes.ToListAsync();

            // Generate 12 rooms each (3 floors x 4 rooms)
            var buildingsList = new[] { b1, b2, b3 };
            foreach (var b in buildingsList)
            {
                for (int floor = 1; floor <= 3; floor++)
                {
                    for (int r = 1; r <= 4; r++)
                    {
                        var roomCode = $"{floor}0{r}";
                        var apt = new Apartment
                        {
                            Id = Guid.NewGuid(),
                            BuildingId = b.Id,
                            RoomCode = roomCode,
                            Floor = floor,
                            AreaSqm = 30 + (r % 2 == 0 ? 3 : 0),
                            ReferencePrice = 5000000 + (floor - 1) * 200000,
                            CurrentPrice = 5000000 + (floor - 1) * 200000,
                            Status = (b.Code == "SH-CENTRAL" && roomCode == "101") ? ApartmentStatus.ĐangThuê : ApartmentStatus.Trống,
                            Description = $"Phòng {roomCode} tầng {floor}, ban công thoáng mát."
                        };
                        context.Apartments.Add(apt);

                        // Generate 6 predefined assets per apartment
                        foreach (var at in allAssetTypes)
                        {
                            context.Assets.Add(new Asset
                            {
                                Id = Guid.NewGuid(),
                                ApartmentId = apt.Id,
                                AssetTypeId = at.Id,
                                Name = $"{at.Name} - P.{roomCode}",
                                Code = $"{b.Code}-{roomCode}-{at.Code}",
                                SerialNumber = $"SN-{roomCode}-{Random.Shared.Next(1000, 9999)}",
                                Condition = AssetCondition.Tốt,
                                InstalledDate = DateTime.UtcNow.AddMonths(-6),
                                LastCheckedAtUtc = DateTime.UtcNow,
                                LastUpdatedBy = "Hệ thống sinh phòng tự động"
                            });
                        }
                    }
                }
            }
            await context.SaveChangesAsync();
        }
    }
}
