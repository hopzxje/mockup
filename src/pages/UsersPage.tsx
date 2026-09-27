import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { storageService } from "../services/storage";
import { formatDateVN } from "../lib/utils";
import { User, UserRole } from "../types";
import {
  ShieldAlert,
  UserPlus,
  Search,
  Lock,
  Unlock,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Shield,
  UserCheck,
  Wrench,
  Home,
  Users,
} from "lucide-react";

export const UsersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "LOCKED">("ALL");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const users = storageService.getUsers();

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (statusFilter === "ACTIVE" && !u.isActive) return false;
    if (statusFilter === "LOCKED" && u.isActive) return false;
    if (
      searchQuery &&
      !u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.phoneNumber.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.isActive).length;
  const lockedCount = users.filter((u) => !u.isActive).length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const managerCount = users.filter((u) => u.role === "MANAGER").length;
  const staffCount = users.filter((u) => u.role === "STAFF").length;
  const residentCount = users.filter((u) => u.role === "RESIDENT").length;

  const handleToggleLock = (user: User) => {
    if (!currentUser) return;
    if (user.id === currentUser.id) {
      alert("Bạn không thể tự khóa tài khoản của chính mình!");
      return;
    }

    const actionText = user.isActive ? "khóa" : "mở khóa";
    if (window.confirm(`Bạn có chắc muốn ${actionText} tài khoản ${user.email} (${user.fullName})?`)) {
      storageService.toggleUserActive(user.id, currentUser);
      showNotification(`Đã ${actionText} tài khoản ${user.email} thành công!`);
    }
  };

  const handleDeleteUser = (user: User) => {
    if (!currentUser) return;
    if (user.id === currentUser.id) {
      alert("Bạn không thể xóa tài khoản hiện đang đăng nhập!");
      return;
    }

    if (
      window.confirm(
        `CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${user.fullName}" (${user.email})? Hành động này sẽ được ghi vào nhật ký kiểm toán.`
      )
    ) {
      const ok = storageService.deleteUser(user.id, currentUser);
      if (ok) {
        showNotification(`Đã xóa tài khoản ${user.email} thành công!`);
      } else {
        alert("Không thể xóa tài khoản này!");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Quản trị Tài khoản Người dùng</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Tạo mới, chỉnh sửa hồ sơ, cấp lại mật khẩu, khóa/mở khóa và kiểm soát truy cập các vai trò hệ thống
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Thêm Tài khoản Mới</span>
        </button>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Account Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tổng Tài khoản</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">{totalUsers}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
            <span className="text-emerald-700 font-semibold">{activeCount} hoạt động</span>
            <span>•</span>
            <span className="text-rose-600 font-semibold">{lockedCount} bị khóa</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Admin Chuỗi</span>
            <Shield className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">{adminCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Quản trị viên hệ thống</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Quản lý & Nhân viên</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-900 mt-1.5 tabular-nums">
            {managerCount + staffCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {managerCount} Quản lý • {staffCount} Nhân viên kỹ thuật
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tài khoản Cư dân</span>
            <Home className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1.5 tabular-nums">{residentCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Truy cập cổng tiện ích cư dân</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Vai trò:</span>
            {["ALL", "ADMIN", "MANAGER", "STAFF", "RESIDENT"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  roleFilter === r
                    ? "bg-[#0F766E] text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r === "ALL" ? "Tất cả" : r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-slate-400 font-medium">Trạng thái:</span>
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                statusFilter === "ALL" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                statusFilter === "ACTIVE" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Hoạt động
            </button>
            <button
              onClick={() => setStatusFilter("LOCKED")}
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                statusFilter === "LOCKED" ? "bg-rose-700 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Bị khóa
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Email đăng nhập</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Phạm vi cơ sở</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày tạo</th>
                <th className="py-3 px-4 text-right">Thao tác Quản trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không tìm thấy tài khoản người dùng phù hợp
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      {u.id === currentUser?.id && (
                        <span className="text-[10px] text-[#0F766E] font-semibold">(Tài khoản hiện tại)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{u.email}</td>
                    <td className="py-3 px-4 text-slate-700">{u.phoneNumber}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          u.role === "ADMIN"
                            ? "bg-teal-100 text-teal-800 border border-teal-200"
                            : u.role === "MANAGER"
                            ? "bg-teal-100 text-teal-800 border border-teal-200"
                            : u.role === "STAFF"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {u.role === "ADMIN" || u.role === "MANAGER" ? (
                        <span className="font-semibold text-teal-800">Toàn chuỗi (Tất cả CS)</span>
                      ) : (
                        <span>{u.assignedBuildingIds.length} cơ sở phân công</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                          Bị khóa
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDateVN(u.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingUser(u)}
                          title="Chỉnh sửa thông tin tài khoản"
                          className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Reset Password Button */}
                        <button
                          onClick={() => setResettingUser(u)}
                          title="Cấp lại mật khẩu tài khoản"
                          className="p-1.5 rounded text-amber-700 hover:bg-amber-50"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Lock / Unlock Toggle */}
                        <button
                          onClick={() => handleToggleLock(u)}
                          disabled={u.id === currentUser?.id}
                          title={u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          className={`p-1.5 rounded transition-colors ${
                            u.id === currentUser?.id
                              ? "opacity-30 cursor-not-allowed"
                              : u.isActive
                              ? "text-rose-600 hover:bg-rose-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {u.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={u.id === currentUser?.id}
                          title="Xóa tài khoản"
                          className={`p-1.5 rounded transition-colors ${
                            u.id === currentUser?.id
                              ? "opacity-30 cursor-not-allowed"
                              : "text-slate-400 hover:text-rose-700 hover:bg-rose-50"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(email) => {
            setShowCreateModal(false);
            showNotification(`Đã tạo tài khoản ${email} thành công!`);
          }}
        />
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            showNotification(`Đã cập nhật thông tin tài khoản ${editingUser.email}!`);
          }}
        />
      )}

      {/* RESET PASSWORD MODAL */}
      {resettingUser && (
        <ResetPasswordModal
          user={resettingUser}
          onClose={() => setResettingUser(null)}
          onSuccess={(tempPass) => {
            setResettingUser(null);
            showNotification(`Đã cấp mật khẩu mới "${tempPass}" cho ${resettingUser.email}!`);
          }}
        />
      )}
    </div>
  );
};

/**
 * CREATE USER MODAL
 */
const CreateUserModal: React.FC<{
  onClose: () => void;
  onSuccess: (email: string) => void;
}> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const buildings = storageService.getBuildings();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<UserRole>("STAFF");
  const [assignedBuildingIds, setAssignedBuildingIds] = useState<string[]>([buildings[0]?.id || ""]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      storageService.createUser(
        {
          fullName,
          email,
          phoneNumber,
          role,
          isActive: true,
          assignedBuildingIds: (role === "ADMIN" || role === "MANAGER") ? buildings.map((b) => b.id) : assignedBuildingIds,
        },
        currentUser
      );
      onSuccess(email);
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi tạo tài khoản!");
    }
  };

  const handleToggleBuilding = (id: string) => {
    setAssignedBuildingIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h3 className="font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#0F766E]" />
          <span>Thêm Tài khoản Người dùng Mới</span>
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Họ và tên:</label>
            <input
              type="text"
              placeholder="Nguyễn Văn An"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Email đăng nhập:</label>
            <input
              type="email"
              placeholder="an.nguyen@stayhub.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Số điện thoại:</label>
            <input
              type="text"
              placeholder="0912 345 678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Vai trò hệ thống:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-slate-800"
            >
              <option value="ADMIN">ADMIN (Quản trị Hệ thống)</option>
              <option value="MANAGER">MANAGER (Quản lý Chuỗi / Cơ sở)</option>
              <option value="STAFF">STAFF (Nhân viên Kỹ thuật & Vận hành)</option>
              <option value="RESIDENT">RESIDENT (Cư dân Căn hộ)</option>
            </select>
          </div>

          {role !== "ADMIN" && role !== "MANAGER" ? (
            <div>
              <label className="block text-slate-700 font-medium mb-1">Phân công Cơ sở phụ trách:</label>
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto">
                {buildings.map((b) => (
                  <label key={b.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignedBuildingIds.includes(b.id)}
                      onChange={() => handleToggleBuilding(b.id)}
                      className="rounded text-teal-700 focus:ring-teal-600"
                    />
                    <span className="text-slate-800 font-medium">{b.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Vai trò này có thẩm quyền phụ trách toàn bộ tất cả cơ sở trong chuỗi StayHub.</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs"
            >
              Tạo tài khoản
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * EDIT USER MODAL
 */
const EditUserModal: React.FC<{
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ user, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const buildings = storageService.getBuildings();

  const [fullName, setFullName] = useState(user.fullName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [role, setRole] = useState<UserRole>(user.role);
  const [assignedBuildingIds, setAssignedBuildingIds] = useState<string[]>(user.assignedBuildingIds);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    storageService.updateUserWithAudit(
      user.id,
      {
        fullName,
        phoneNumber,
        role,
        assignedBuildingIds: (role === "ADMIN" || role === "MANAGER") ? buildings.map((b) => b.id) : assignedBuildingIds,
      },
      currentUser
    );
    onSuccess();
  };

  const handleToggleBuilding = (id: string) => {
    setAssignedBuildingIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h3 className="font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Edit2 className="w-4 h-4 text-teal-700" />
          <span>Chỉnh sửa Tài khoản: {user.email}</span>
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Email đăng nhập (Cố định):</label>
            <input
              type="text"
              disabled
              value={user.email}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Họ và tên:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Số điện thoại:</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Vai trò hệ thống:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-slate-800"
            >
              <option value="ADMIN">ADMIN (Quản trị Hệ thống)</option>
              <option value="MANAGER">MANAGER (Quản lý Chuỗi / Cơ sở)</option>
              <option value="STAFF">STAFF (Nhân viên Kỹ thuật & Vận hành)</option>
              <option value="RESIDENT">RESIDENT (Cư dân Căn hộ)</option>
            </select>
          </div>

          {role !== "ADMIN" && role !== "MANAGER" ? (
            <div>
              <label className="block text-slate-700 font-medium mb-1">Cơ sở phụ trách:</label>
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto">
                {buildings.map((b) => (
                  <label key={b.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignedBuildingIds.includes(b.id)}
                      onChange={() => handleToggleBuilding(b.id)}
                      className="rounded text-teal-700 focus:ring-teal-600"
                    />
                    <span className="text-slate-800 font-medium">{b.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Vai trò này có thẩm quyền phụ trách toàn bộ tất cả cơ sở trong chuỗi StayHub.</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * RESET PASSWORD MODAL
 */
const ResetPasswordModal: React.FC<{
  user: User;
  onClose: () => void;
  onSuccess: (tempPass: string) => void;
}> = ({ user, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [tempPassword, setTempPassword] = useState(`StayHub@${Math.floor(1000 + Math.random() * 9000)}`);
  const [copied, setCopied] = useState(false);

  const handleConfirm = () => {
    if (!currentUser) return;
    storageService.resetUserPassword(user.id, tempPassword, currentUser);
    onSuccess(tempPassword);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
        <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span>Cấp lại Mật khẩu Người dùng</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tài khoản: <strong className="text-slate-800">{user.email}</strong> ({user.fullName})
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Mật khẩu tạm thời mới:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="flex-1 font-mono font-bold text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-teal-800"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 font-semibold"
                title="Sao chép mật khẩu"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
            Hành động này sẽ được ghi vào <strong>Nhật ký Audit Log</strong>. Người dùng sẽ sử dụng mật khẩu này để đăng nhập và được yêu cầu đổi mật khẩu ở lần đăng nhập tiếp theo.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Xác nhận Đặt lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
