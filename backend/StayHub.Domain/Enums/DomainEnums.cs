namespace StayHub.Domain.Enums;

public enum UserRole
{
    ADMIN,
    MANAGER,
    STAFF,
    RESIDENT
}

public enum ApartmentStatus
{
    Trống,
    ĐãGiữChỗ,
    ĐangThuê,
    BảoTrì,
    NgừngSửDụng
}

public enum AssetCondition
{
    Tốt,
    HưHỏng,
    ĐangSửa,
    NgừngSửDụng
}

public enum ContractStatus
{
    Nháp,
    ChờDuyệt,
    ĐãDuyệt,
    ĐangHiệuLực,
    HếtHạn,
    ĐãChấmDứt
}

public enum InvoiceStatus
{
    Nháp,
    ChưaThanhToán,
    ThanhToánMộtPhần,
    ĐãThanhToán,
    ĐãHủy
}

public enum UtilityType
{
    ELECTRICITY,
    WATER
}

public enum FeeCalculationType
{
    PER_ROOM,
    PER_PERSON,
    PER_CONSUMPTION
}

public enum MaintenancePriority
{
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}

public enum MaintenanceStatus
{
    Mới,
    ĐãPhânCông,
    ĐangXửLý,
    HoànThành,
    Hủy
}

public enum VisitorStatus
{
    ChờDuyệt,
    ĐãDuyệt,
    TừChối
}
