import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBuilding } from "../context/BuildingContext";
import { storageService } from "../services/storage";
import { formatDateVN, formatDateTimeVN } from "../lib/utils";
import { InAppNotification, NotificationScope, NotificationCategory } from "../types";
import { ZNS_TEMPLATES, ZALO_OA_CONFIG } from "../services/integrations/zalo";
import {
  Bell,
  Search,
  Plus,
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Layers,
  Wrench,
} from "lucide-react";

export const NotificationsPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { selectedBuildingId } = useBuilding();

  const [activeTab, setActiveTab] = useState<"inapp" | "zalo">("inapp");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<InAppNotification | null>(null);

  const notifications = storageService.getNotifications(currentUser || undefined);
  const zaloRecords = storageService.getZaloRecords();

  const filteredNotifications = notifications.filter((n) => {
    if (categoryFilter !== "ALL" && n.category !== categoryFilter) return false;
    return true;
  });

  const handleRead = (n: InAppNotification) => {
    setSelectedNotif(n);
    if (currentUser && !n.readByUserIds.includes(currentUser.id)) {
      storageService.markNotificationAsRead(n.id, currentUser.id);
    }
  };

  const getCategoryBadge = (cat?: NotificationCategory) => {
    switch (cat) {
      case "MAINTENANCE":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-fit">
            <Wrench className="w-3 h-3 text-amber-700" />
            Bảo hành & Sửa chữa
          </span>
        );
      case "INVOICE":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            Hóa đơn & Phí
          </span>
        );
      case "SECURITY":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
            An ninh & Nội quy
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Thông báo chung
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Thông báo Đa kênh & Zalo ZNS</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Phát thanh thông báo trong ứng dụng tới cư dân và kiểm soát nhật ký tin nhắn dịch vụ Zalo ZNS
          </p>
        </div>

        {currentRole !== "RESIDENT" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Soạn Thông Báo Mới</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab("inapp")}
          className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "inapp"
              ? "border-[#0F766E] text-[#0F766E] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Thông báo Ứng dụng ({notifications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("zalo")}
          className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "zalo"
              ? "border-[#0F766E] text-[#0F766E] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>Nhật ký Gửi Zalo ZNS ({zaloRecords.length})</span>
        </button>
      </div>

      {/* TAB 1: IN-APP NOTIFICATIONS */}
      {activeTab === "inapp" && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Chưa có thông báo nào trong hệ thống
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = currentUser ? n.readByUserIds.includes(currentUser.id) : true;
              return (
                <div
                  key={n.id}
                  onClick={() => handleRead(n)}
                  className={`bg-white rounded-xl border p-4 shadow-xs hover:border-teal-300 transition-all cursor-pointer ${
                    !isRead ? "border-l-4 border-l-teal-600 bg-teal-50/20" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            n.scope === "ALL"
                              ? "bg-purple-100 text-purple-800"
                              : n.scope === "BUILDING"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-teal-100 text-teal-800"
                          }`}
                        >
                          {n.scope === "ALL"
                            ? "Toàn chuỗi"
                            : n.scope === "BUILDING"
                            ? n.buildingName
                            : "Cá nhân"}
                        </span>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {formatDateTimeVN(n.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900">{n.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{n.content}</p>
                    </div>

                    <div className="text-right shrink-0 text-xs text-slate-400">
                      <span>Người gửi: <strong>{n.authorName}</strong></span>
                      <span className="block text-[10px] mt-0.5">{n.authorRole}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: ZALO ZNS DELIVERY LOGS */}
      {activeTab === "zalo" && (
        <div className="space-y-4">
          {/* Zalo OA Header Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
                Z
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{ZALO_OA_CONFIG.OA_NAME}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    OA ĐÃ XÁC THỰC
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  OA ID: <span className="font-mono">{ZALO_OA_CONFIG.OA_ID}</span> • App ID: {ZALO_OA_CONFIG.APP_ID}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <span>Đang áp dụng: <strong className="text-slate-900">4 Template ZNS chính thức</strong></span>
            </div>
          </div>

          {/* Delivery Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="py-3 px-4">Sự kiện kích hoạt</th>
                    <th className="py-3 px-4">Người nhận</th>
                    <th className="py-3 px-4">Số điện thoại</th>
                    <th className="py-3 px-4">Mẫu ZNS</th>
                    <th className="py-3 px-4">Trạng thái gửi</th>
                    <th className="py-3 px-4">Số lần thử</th>
                    <th className="py-3 px-4">Thời gian gửi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {zaloRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{rec.eventName}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{rec.recipientName}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{rec.recipientPhone}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-medium text-slate-800">{rec.templateName}</span>
                        <span className="block font-mono text-[10px] text-slate-400">{rec.templateId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            rec.status === "Đã giao"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : rec.status === "Đã tiếp nhận"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{rec.retryCount}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDateTimeVN(rec.sentAt || rec.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {selectedNotif.scope === "ALL" ? "Toàn bộ chuỗi" : selectedNotif.buildingName || "Cá nhân"}
              </span>
              <button
                onClick={() => setSelectedNotif(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <h3 className="font-bold text-base text-slate-900">{selectedNotif.title}</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                {selectedNotif.content}
              </p>

              <div className="pt-2 text-[11px] text-slate-400 flex justify-between">
                <span>Người phát hành: <strong>{selectedNotif.authorName}</strong> ({selectedNotif.authorRole})</span>
                <span>{formatDateTimeVN(selectedNotif.createdAt)}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NOTIFICATION MODAL */}
      {showCreateModal && (
        <CreateNotificationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

const CreateNotificationModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const { currentUser, currentRole } = useAuth();
  const { buildings, selectedBuildingId } = useBuilding();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scope, setScope] = useState<NotificationScope>("ALL");
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || "");

  // Preview recipients count
  const estimatedRecipients =
    scope === "ALL"
      ? storageService.getApartments().length
      : storageService.getApartments(buildingId).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const bld = buildings.find((b) => b.id === buildingId);

    try {
      storageService.createNotification(
        {
          title,
          content,
          scope,
          buildingId: scope === "BUILDING" ? buildingId : undefined,
          buildingName: scope === "BUILDING" && bld ? bld.name : undefined,
          isPublished: true,
          publishedAt: new Date().toISOString(),
          recipientCount: estimatedRecipients,
        },
        currentUser
      );

      alert(`Đã xuất bản thông báo thành công tới ${estimatedRecipients} phòng!`);
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-bold text-sm text-slate-900">Soạn Thông Báo Mới</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Phạm vi gửi thông báo:</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as NotificationScope)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
            >
              {currentRole === "ADMIN" && <option value="ALL">Toàn bộ chuỗi (Tất cả cư dân)</option>}
              <option value="BUILDING">Một cơ sở cụ thể</option>
            </select>
          </div>

          {scope === "BUILDING" && (
            <div>
              <label className="block text-slate-700 font-medium mb-1">Chọn Cơ sở:</label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-medium mb-1">Tiêu đề thông báo:</label>
            <input
              type="text"
              placeholder="Vd: Lịch cúp nước bảo dưỡng, nhắc đóng tiền phòng..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Nội dung chi tiết:</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung đầy đủ gửi đến cư dân..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-500">Ước tính số người nhận:</span>
            <span className="font-bold text-teal-800 text-sm">~{estimatedRecipients} cư dân</span>
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
              type="submit"
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs"
            >
              Xuất bản Thông Báo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
