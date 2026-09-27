using System;
using System.Collections.Generic;
using StayHub.Domain.Enums;

namespace StayHub.Domain.Entities;

public class Building
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int TotalFloors { get; set; }
    public int TotalRooms { get; set; }
    public string ManagerId { get; set; } = string.Empty;
    public string ManagerName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public ICollection<Apartment> Apartments { get; set; } = new List<Apartment>();
    public ICollection<StaffBuildingAssignment> StaffAssignments { get; set; } = new List<StaffBuildingAssignment>();
    public ICollection<Fee> Fees { get; set; } = new List<Fee>();
}

public class Apartment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BuildingId { get; set; }
    public Building Building { get; set; } = null!;

    public string RoomCode { get; set; } = string.Empty;
    public int Floor { get; set; }
    public decimal AreaSqm { get; set; }
    public decimal ReferencePrice { get; set; } // VND decimal(18,0)
    public decimal CurrentPrice { get; set; }
    public ApartmentStatus Status { get; set; } = ApartmentStatus.Trống;
    public string Description { get; set; } = string.Empty;

    public Guid? CurrentContractId { get; set; }
    public Guid? CurrentResidentId { get; set; }
    public string? CurrentResidentName { get; set; }

    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
    public ICollection<RentalContract> Contracts { get; set; } = new List<RentalContract>();
    public ICollection<UtilityReading> UtilityReadings { get; set; } = new List<UtilityReading>();
    public ICollection<MaintenanceRequest> MaintenanceRequests { get; set; } = new List<MaintenanceRequest>();
}

public class AssetType
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int DefaultLifeMonths { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class Asset
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ApartmentId { get; set; }
    public Apartment Apartment { get; set; } = null!;

    public Guid AssetTypeId { get; set; }
    public AssetType AssetType { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public AssetCondition Condition { get; set; } = AssetCondition.Tốt;
    public DateTime InstalledDate { get; set; }
    public DateTime LastCheckedAtUtc { get; set; }
    public string LastUpdatedBy { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class Resident
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string NationalId { get; set; } = string.Empty; // CCCD
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Hometown { get; set; } = string.Empty;
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
    public string Status { get; set; } = "Đang thuê";

    public Guid? CurrentApartmentId { get; set; }
    public Guid? CurrentContractId { get; set; }
    public DateTime? CheckedInAtUtc { get; set; }
    public DateTime? CheckedOutAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<RentalContract> Contracts { get; set; } = new List<RentalContract>();
}

public class StaffBuildingAssignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string StaffUserId { get; set; } = string.Empty;
    public Guid BuildingId { get; set; }
    public Building Building { get; set; } = null!;
    public DateTime AssignedAtUtc { get; set; } = DateTime.UtcNow;
}

public class RentalContract
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ContractCode { get; set; } = string.Empty;
    public Guid BuildingId { get; set; }
    public Building Building { get; set; } = null!;

    public Guid ApartmentId { get; set; }
    public Apartment Apartment { get; set; } = null!;

    public Guid ResidentId { get; set; }
    public Resident Resident { get; set; } = null!;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal RentPrice { get; set; } // VND decimal(18,0)
    public decimal DepositAmount { get; set; }
    public int PaymentCycleMonths { get; set; } = 1;
    public string Terms { get; set; } = string.Empty;
    public ContractStatus Status { get; set; } = ContractStatus.Nháp;

    public string? RejectionReason { get; set; }
    public string? TerminationReason { get; set; }
    public DateTime? TerminatedAtUtc { get; set; }
    public decimal? DepositRefunded { get; set; }
    public decimal? DepositDeducted { get; set; }

    public string CreatedBy { get; set; } = string.Empty;
    public string? ApprovedBy { get; set; }
    public Guid? RenewedFromContractId { get; set; }

    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}

public class Fee
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BuildingId { get; set; }
    public Building Building { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public FeeCalculationType CalculationType { get; set; } = FeeCalculationType.PER_ROOM;
    public decimal UnitPrice { get; set; }
    public string UnitName { get; set; } = "phòng/tháng";
    public bool IsActive { get; set; } = true;
    public DateTime EffectiveDate { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class UtilityReading
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BuildingId { get; set; }
    public Guid ApartmentId { get; set; }
    public Apartment Apartment { get; set; } = null!;

    public UtilityType UtilityType { get; set; }
    public int PeriodMonth { get; set; }
    public int PeriodYear { get; set; }
    public decimal PreviousIndex { get; set; }
    public decimal CurrentIndex { get; set; }
    public decimal Consumption { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }

    public string RecordedBy { get; set; } = string.Empty;
    public DateTime RecordedAtUtc { get; set; } = DateTime.UtcNow;
    public bool IsInvoiced { get; set; } = false;
    public string? Notes { get; set; }
}

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string InvoiceCode { get; set; } = string.Empty;
    public Guid BuildingId { get; set; }
    public Guid ApartmentId { get; set; }
    public Guid ContractId { get; set; }
    public RentalContract Contract { get; set; } = null!;

    public Guid ResidentId { get; set; }
    public string ResidentName { get; set; } = string.Empty;
    public string ResidentPhone { get; set; } = string.Empty;

    public int PeriodMonth { get; set; }
    public int PeriodYear { get; set; }
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }

    public decimal TotalAmount { get; set; } // VND decimal(18,0)
    public decimal PaidAmount { get; set; }
    public decimal BalanceRemaining { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.ChưaThanhToán;

    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

public class InvoiceItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;

    public string ItemType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
    public string? DetailSnapshotJson { get; set; }
}

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;

    public string TransactionCode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "SEPAY_QR";
    public DateTime PaymentDateUtc { get; set; } = DateTime.UtcNow;
    public string ReferenceCode { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string PayerName { get; set; } = string.Empty;
    public string Status { get; set; } = "Thành công";
    public string? Notes { get; set; }
}

public class MaintenanceRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string RequestCode { get; set; } = string.Empty;
    public Guid BuildingId { get; set; }
    public Guid ApartmentId { get; set; }
    public Apartment Apartment { get; set; } = null!;

    public Guid ResidentId { get; set; }
    public string ResidentName { get; set; } = string.Empty;
    public string ResidentPhone { get; set; } = string.Empty;

    public Guid? AssetId { get; set; }
    public string? AssetName { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MaintenancePriority Priority { get; set; } = MaintenancePriority.MEDIUM;
    public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Mới;

    public string? AssignedStaffId { get; set; }
    public string? AssignedStaffName { get; set; }
    public string? CompletionNotes { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class VisitorRegistration
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string RegistrationCode { get; set; } = string.Empty;
    public Guid BuildingId { get; set; }
    public Guid ApartmentId { get; set; }
    public Apartment Apartment { get; set; } = null!;

    public Guid ResidentId { get; set; }
    public string ResidentName { get; set; } = string.Empty;
    public string VisitorName { get; set; } = string.Empty;
    public string VisitorIdNumber { get; set; } = string.Empty;
    public string VisitorPhone { get; set; } = string.Empty;

    public DateTime VisitDate { get; set; }
    public string ExpectedArrival { get; set; } = string.Empty;
    public string ExpectedDeparture { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public VisitorStatus Status { get; set; } = VisitorStatus.ChờDuyệt;

    public string? ReviewedBy { get; set; }
    public string? ReviewNotes { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class InAppNotification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Scope { get; set; } = "ALL";
    public Guid? BuildingId { get; set; }
    public Guid? ApartmentId { get; set; }
    public Guid? ResidentId { get; set; }

    public string AuthorName { get; set; } = string.Empty;
    public string AuthorRole { get; set; } = string.Empty;
    public bool IsPublished { get; set; } = true;
    public DateTime? PublishedAtUtc { get; set; }
    public int RecipientCount { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public Guid? BuildingId { get; set; }
    public string? BuildingName { get; set; }
    public string Details { get; set; } = string.Empty;
    public string IpAddress { get; set; } = "127.0.0.1";
}
