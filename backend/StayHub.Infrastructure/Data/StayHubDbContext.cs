using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StayHub.Domain.Entities;
using StayHub.Domain.Enums;

namespace StayHub.Infrastructure.Data;

public class ApplicationUser : Microsoft.AspNetCore.Identity.IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public string? AvatarUrl { get; set; }
    public Guid? ResidentId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class ApplicationRole : Microsoft.AspNetCore.Identity.IdentityRole
{
}

public class StayHubDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>
{
    public StayHubDbContext(DbContextOptions<StayHubDbContext> options) : base(options)
    {
    }

    public DbSet<Building> Buildings => Set<Building>();
    public DbSet<Apartment> Apartments => Set<Apartment>();
    public DbSet<AssetType> AssetTypes => Set<AssetType>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<StaffBuildingAssignment> StaffBuildingAssignments => Set<StaffBuildingAssignment>();
    public DbSet<RentalContract> RentalContracts => Set<RentalContract>();
    public DbSet<Fee> Fees => Set<Fee>();
    public DbSet<UtilityReading> UtilityReadings => Set<UtilityReading>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<MaintenanceRequest> MaintenanceRequests => Set<MaintenanceRequest>();
    public DbSet<VisitorRegistration> VisitorRegistrations => Set<VisitorRegistration>();
    public DbSet<InAppNotification> Notifications => Set<InAppNotification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Building configuration
        builder.Entity<Building>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.RowVersion).IsRowVersion();
        });

        // Apartment configuration
        builder.Entity<Apartment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.BuildingId, e.RoomCode }).IsUnique();
            entity.Property(e => e.RoomCode).HasMaxLength(20).IsRequired();
            entity.Property(e => e.ReferencePrice).HasPrecision(18, 0);
            entity.Property(e => e.CurrentPrice).HasPrecision(18, 0);
            entity.Property(e => e.AreaSqm).HasPrecision(10, 2);
            entity.Property(e => e.RowVersion).IsRowVersion();

            entity.HasOne(e => e.Building)
                  .WithMany(b => b.Apartments)
                  .HasForeignKey(e => e.BuildingId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Asset & AssetType configuration
        builder.Entity<AssetType>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
        });

        builder.Entity<Asset>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).HasMaxLength(100).IsRequired();
            entity.Property(e => e.SerialNumber).HasMaxLength(100);

            entity.HasOne(e => e.Apartment)
                  .WithMany(a => a.Assets)
                  .HasForeignKey(e => e.ApartmentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.AssetType)
                  .WithMany()
                  .HasForeignKey(e => e.AssetTypeId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // RentalContract configuration
        builder.Entity<RentalContract>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ContractCode).IsUnique();
            entity.Property(e => e.ContractCode).HasMaxLength(50).IsRequired();
            entity.Property(e => e.RentPrice).HasPrecision(18, 0);
            entity.Property(e => e.DepositAmount).HasPrecision(18, 0);
            entity.Property(e => e.DepositRefunded).HasPrecision(18, 0);
            entity.Property(e => e.DepositDeducted).HasPrecision(18, 0);
            entity.Property(e => e.RowVersion).IsRowVersion();

            entity.HasOne(e => e.Building)
                  .WithMany()
                  .HasForeignKey(e => e.BuildingId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Apartment)
                  .WithMany(a => a.Contracts)
                  .HasForeignKey(e => e.ApartmentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Resident)
                  .WithMany(r => r.Contracts)
                  .HasForeignKey(e => e.ResidentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Fee configuration
        builder.Entity<Fee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 0);

            entity.HasOne(e => e.Building)
                  .WithMany(b => b.Fees)
                  .HasForeignKey(e => e.BuildingId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // UtilityReading configuration
        builder.Entity<UtilityReading>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ApartmentId, e.UtilityType, e.PeriodMonth, e.PeriodYear }).IsUnique();
            entity.Property(e => e.PreviousIndex).HasPrecision(12, 2);
            entity.Property(e => e.CurrentIndex).HasPrecision(12, 2);
            entity.Property(e => e.Consumption).HasPrecision(12, 2);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 0);
            entity.Property(e => e.TotalAmount).HasPrecision(18, 0);

            entity.HasOne(e => e.Apartment)
                  .WithMany(a => a.UtilityReadings)
                  .HasForeignKey(e => e.ApartmentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Invoice & Payment configuration
        builder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.InvoiceCode).IsUnique();
            entity.Property(e => e.InvoiceCode).HasMaxLength(50).IsRequired();
            entity.Property(e => e.TotalAmount).HasPrecision(18, 0);
            entity.Property(e => e.PaidAmount).HasPrecision(18, 0);
            entity.Property(e => e.BalanceRemaining).HasPrecision(18, 0);
            entity.Property(e => e.RowVersion).IsRowVersion();

            entity.HasOne(e => e.Contract)
                  .WithMany(c => c.Invoices)
                  .HasForeignKey(e => e.ContractId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<InvoiceItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(12, 2);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 0);
            entity.Property(e => e.Amount).HasPrecision(18, 0);

            entity.HasOne(e => e.Invoice)
                  .WithMany(i => i.Items)
                  .HasForeignKey(e => e.InvoiceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TransactionCode).IsUnique();
            entity.Property(e => e.Amount).HasPrecision(18, 0);

            entity.HasOne(e => e.Invoice)
                  .WithMany(i => i.Payments)
                  .HasForeignKey(e => e.InvoiceId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Maintenance & Visitors
        builder.Entity<MaintenanceRequest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.RequestCode).IsUnique();

            entity.HasOne(e => e.Apartment)
                  .WithMany(a => a.MaintenanceRequests)
                  .HasForeignKey(e => e.ApartmentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<VisitorRegistration>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.RegistrationCode).IsUnique();

            entity.HasOne(e => e.Apartment)
                  .WithMany()
                  .HasForeignKey(e => e.ApartmentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // AuditLog configuration
        builder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).HasMaxLength(100).IsRequired();
            entity.Property(e => e.EntityName).HasMaxLength(100).IsRequired();
        });
    }
}
