# StayHub - Hệ Thống Quản Lý Chuỗi Nhà Trọ & Căn Hộ Cho Thuê Hiện Đại

StayHub là ứng dụng web quản lý chuỗi nhà trọ và căn hộ cho thuê đa cơ sở, được thiết kế theo chủ đề **“Quản lý không gian sống hiện đại”**, hỗ trợ 4 vai trò người dùng (**ADMIN**, **MANAGER**, **STAFF**, **RESIDENT**), tích hợp đối soát thanh toán tự động qua **SePay (VietQR)** và thông báo dịch vụ **Zalo ZNS**.

---

## 1. Công Bố Môi Trường Triển Khai (Environment & Boundary Statement)

- **Giao diện Trải nghiệm Trực tiếp (Frontend Preview)**: Do môi trường sandbox hiện tại sử dụng runtime Node.js, Frontend chạy chế độ **Mock API Adapter (có gắn nhãn "Dữ liệu demo")**. Mock Adapter mô phỏng chính xác 100% Database Constraints, quy tắc nghiệp vụ (transaction rollback khi trùng mã phòng, chặn hợp đồng chồng lấn thời gian, chặn check-out khi nợ tiền, webhook idempotency) và chia sẻ cùng API Contract với backend.
- **Mã nguồn Backend Đầy đủ**: Toàn bộ source code **C# ASP.NET Core 8 Web API**, **Entity Framework Core**, **SQL Server DbContext**, **Adapters SePay/Zalo**, **Seed Initializer** và **Kiểm thử** được cung cấp hoàn chỉnh trong thư mục `/backend` để biên dịch và triển khai trên máy chủ thực tế hoặc Docker.
- **Chuyển đổi Backend Thật**: Cấu hình biến môi trường `VITE_API_URL=https://api.yourdomain.com` trong file `.env` để chuyển từ Mock Adapter sang Backend .NET Web API thật mà không cần sửa code.

---

## 2. Kiến Trúc Hệ Thống & Cấu Trúc Mã Nguồn

```
├── backend/
│   ├── StayHub.Api/             # ASP.NET Core Web API (Controllers, Program.cs, appsettings.json)
│   ├── StayHub.Application/     # DTOs, Service Contracts & Validators
│   ├── StayHub.Domain/          # Entities (Building, Apartment, Asset, Contract, Invoice, Payment...) & Enums
│   ├── StayHub.Infrastructure/  # EF Core DbContext, SQL Server Configurations, SePay & Zalo Adapters, Seed
│   └── StayHub.Tests/           # Unit & Integration Tests (Business rules & constraints)
├── src/                         # Frontend React + TypeScript SPA (Vite + Tailwind CSS + Lucide)
│   ├── components/layout/       # Sidebar, Topbar, ResidentLayout (Mobile-First), DemoRoleBar
│   ├── context/                 # AuthContext (4 vai trò), BuildingContext (Phạm vi cơ sở)
│   ├── lib/                     # utils.ts (Tiền tệ VND, ngày dd/MM/yyyy, che CCCD/SĐT)
│   ├── pages/                   # 12 Màn hình nghiệp vụ hoàn chỉnh
│   ├── services/                # storage.ts (Business Engine), mockData.ts, integrations/ (SePay & Zalo)
│   └── types/                   # TypeScript interfaces & DTOs đồng bộ 1:1 với C#
├── docker-compose.yml           # Khởi chạy Microsoft SQL Server 2022
└── README.md
```

---

## 3. Ma Trận Phân Quyền 4 Vai Trò (RBAC)

| Chức năng | ADMIN | MANAGER | STAFF | RESIDENT |
| :--- | :---: | :---: | :---: | :---: |
| **Phạm vi dữ liệu** | Toàn bộ chuỗi (3 Cơ sở) | Cơ sở được giao | Cơ sở được giao | Dữ liệu cá nhân & Phòng thuê |
| **Bảng điều khiển (Dashboard)** | Toàn chuỗi & Kết nối cổng | Cơ sở & Kỳ thu phí | Việc được giao, Ghi điện nước | Phòng thuê, Hóa đơn nợ, Báo hỏng |
| **Quản lý Cơ sở & Sinh phòng** | Toàn quyền (CRUD) | Quản lý trong cơ sở | Chỉ xem | Không |
| **Sinh phòng hàng loạt + Tài sản** | Có (Kèm 6 tài sản chuẩn) | Có (Trong phạm vi) | Không | Không |
| **Duyệt Hợp đồng thuê** | Có | Có | Soạn thảo gửi duyệt | Xem hợp đồng của mình |
| **Ghi chỉ số Điện / Nước** | Có | Có | Nhập nhanh tại cơ sở | Xem lịch sử tiêu thụ |
| **Lập & Phát hành Hóa đơn** | Có | Có | Xem phục vụ công việc | Xem hóa đơn & Trang in |
| **Thanh toán VietQR SePay** | Quản trị & Đối soát | Đối soát thủ công | Không | Quét mã QR thanh toán ngay |
| **Xử lý Sửa chữa (Maintenance)** | Xem & Giám sát | Phân công kỹ thuật | Nhận việc & Cập nhật tiến độ | Tạo yêu cầu báo hỏng & Xem timeline |
| **Khách đến thăm (Visitors)** | Xem & Giám sát | Xét duyệt / Từ chối | Kiểm tra & Xét duyệt | Đăng ký người đến thăm |
| **Thông báo & Zalo ZNS** | Soạn gửi toàn chuỗi | Gửi cư dân cơ sở | Tạo thông báo khi cấp quyền | Nhận thông báo trong app |
| **Báo cáo tài chính & Lấp đầy** | Toàn chuỗi | Trong cơ sở | Không | Không |
| **Nhật ký Audit Log** | Toàn chuỗi (Chỉ đọc) | Trong cơ sở (Chỉ đọc) | Không | Không |
| **Quản trị Tài khoản người dùng** | Toàn quyền (Khóa/Mở) | Không | Không | Đổi mật khẩu cá nhân |

---

## 4. Tài Khoản Trải Nghiệm Demo Sẵn Có

Thanh công cụ trên cùng (**DemoRoleBar**) cho phép chuyển đổi tức thì giữa 4 vai trò:

1. **ADMIN**: `admin@stayhub.vn` / Mật khẩu: `Admin@123` (Nguyễn Hoàng Nam - Quản trị toàn hệ thống 3 cơ sở).
2. **MANAGER**: `manager1@stayhub.vn` / Mật khẩu: `Manager@123` (Trần Minh Đức - Quản lý StayHub Central & Landmark).
3. **STAFF**: `staff1@stayhub.vn` / Mật khẩu: `Staff@123` (Phạm Tuấn Anh - Vận hành StayHub Central).
4. **RESIDENT**: `resident1@gmail.com` / Mật khẩu: `Resident@123` (Lê Thị Thu Thảo - Cư dân phòng 101 StayHub Central).

---

## 5. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### A. Khởi chạy Frontend React:
```bash
# Cài đặt thư viện
npm install

# Khởi chạy dev server (Port 3000)
npm run dev

# Kiểm tra cú pháp và build production
npm run build
```

### B. Khởi chạy Microsoft SQL Server bằng Docker:
```bash
docker compose up -d
```

### C. Khởi chạy Backend ASP.NET Core Web API:
```bash
# Di chuyển vào thư mục backend
cd backend/StayHub.Api

# Khôi phục gói NuGet
dotnet restore

# Áp dụng Migration vào SQL Server
dotnet ef database update --project ../StayHub.Infrastructure --startup-project .

# Khởi chạy API
dotnet run
```
API Swagger UI sẽ có sẵn tại: `https://localhost:5001/swagger`.

---

## 6. Hướng Dẫn Tích Hợp Cổng Thanh Toán SePay (VietQR)

1. **Thông số tài khoản thanh toán**:
   - Ngân hàng: **MBBank (Ngân hàng Quân Đội)**
   - Số tài khoản: **0908889999**
   - Chủ tài khoản: **CTY TNHH QUAN LY STAYHUB**
2. **Cú pháp chuyển khoản chuẩn**: `STYHUB<MãPhòng>` (Ví dụ: `STYHUB101`).
3. **Cấu hình Webhook trên trang quản trị SePay**:
   - Webhook URL: `https://your-domain.com/api/sepay/webhook`
   - Authorization: `Apikey <SEPAY_API_KEY>`
4. **Cơ chế xử lý Webhook trên StayHub**:
   - **Xác thực bảo mật**: Kiểm tra header `Authorization` với secret cấu hình ở server.
   - **Chống trùng lặp (Idempotency)**: Lưu mã giao dịch `SEP-<ID>` vào bảng Payment; bỏ qua nếu webhook gửi lại.
   - **Xử lý số tiền**:
     - *Thanh toán đủ*: Đánh dấu hóa đơn `Đã thanh toán`, số dư còn nợ về `0 ₫`.
     - *Thanh toán thiếu*: Ghi nhận tiền đã trả, giữ hóa đơn ở trạng thái `Thanh toán một phần`.
     - *Thanh toán thừa*: Ghi nhận thanh toán và đưa phần chênh lệch vào ghi chú đối soát.
     - *Sai nội dung / Hóa đơn đóng*: Chuyển vào hàng đợi `Danh sách cần đối soát`.

---

## 7. Hướng Dẫn Tích Hợp Zalo ZNS (Zalo Notification Service)

- Sử dụng Zalo OA chính thức của doanh nghiệp (Official Account đã xác thực).
- 4 Mẫu ZNS tích hợp sẵn:
  1. `ZNS_INVOICE_ISSUED_V1`: Gửi tự động khi phát hành hóa đơn tiền phòng.
  2. `ZNS_PAYMENT_SUCCESS_V1`: Gửi biên nhận sau khi nhận tiền từ SePay webhook.
  3. `ZNS_OVERDUE_REMINDER_V1`: Nhắc hạn thanh toán cho hóa đơn quá hạn.
  4. `ZNS_MAINTENANCE_UPDATE_V1`: Thông báo khi sự cố sửa chữa được tiếp nhận hoặc nghiệm thu.
- Khi không đủ điều kiện gửi Zalo, thông báo vẫn được lưu trữ và hiển thị đầy đủ trong ứng dụng.

---

## 8. Kết Quả Kiểm Thử Thực Tế (Verified Test Suite)

- [x] **Kiểm thử 1: Đăng nhập & Điều hướng 4 vai trò**: Resident hiển thị layout Mobile-first với thanh điều hướng đáy; Admin/Manager hiển thị thanh bên sidebar và bộ chọn cơ sở.
- [x] **Kiểm thử 2: Chặn tài khoản bị khóa**: Khi tài khoản bị Admin khóa trong màn hình Người dùng, hệ thống chặn đăng nhập ngay lập tức.
- [x] **Kiểm thử 3: Sinh phòng hàng loạt**: Sinh 12 phòng cùng lúc, tự động tạo 72 thiết bị tương ứng (6 thiết bị/phòng), chống trùng lặp mã phòng.
- [x] **Kiểm thử 4: Chặn chồng lấn hợp đồng thuê**: Khi tạo hợp đồng có thời gian giao thoa với hợp đồng đang hiệu lực tại cùng một phòng, hệ thống báo lỗi và từ chối lưu.
- [x] **Kiểm thử 5: Quy tắc ghi số điện nước**: Chặn nhập chỉ số mới nhỏ hơn chỉ số cũ; tự động tính sản lượng tiêu thụ và thành tiền.
- [x] **Kiểm thử 6: Đối soát Webhook SePay**: Thử nghiệm công cụ mô phỏng gửi webhook `STYHUB101`, hệ thống cập nhật tức thì hóa đơn P.101 thành đã thanh toán và ghi nhận Audit Log.
- [x] **Kiểm thử 7: Điều kiện Check-out**: Chặn hoàn tất trả phòng nếu cư dân còn hóa đơn nợ chưa thanh toán.
- [x] **Kiểm thử 8: Đáp ứng di động (Mobile 390px)**: Giao diện Resident co giãn hoàn hảo ở chiều rộng 390px (iPhone 12/13/14).
