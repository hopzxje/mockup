import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBuilding } from "../context/BuildingContext";
import { storageService } from "../services/storage";
import { formatCurrencyVND } from "../lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2, Building2 } from "lucide-react";

export const ReportsPage: React.FC = () => {
  const { selectedBuildingId } = useBuilding();
  const buildings = storageService.getBuildings();
  const apartments = storageService.getApartments(selectedBuildingId);
  const invoices = storageService.getInvoices({ buildingId: selectedBuildingId });
  const maintenance = storageService.getMaintenanceRequests({ buildingId: selectedBuildingId });

  // 1. Occupancy Data
  const occupiedCount = apartments.filter((a) => a.status === "Đang thuê").length;
  const vacantCount = apartments.filter((a) => a.status === "Trống").length;
  const reservedCount = apartments.filter((a) => a.status === "Đã giữ chỗ").length;
  const maintenanceCount = apartments.filter((a) => a.status === "Bảo trì").length;

  const roomStatusData = [
    { name: "Đang thuê", value: occupiedCount, color: "#0F766E" },
    { name: "Phòng trống", value: vacantCount, color: "#10B981" },
    { name: "Đã giữ chỗ", value: reservedCount, color: "#F59E0B" },
    { name: "Bảo trì", value: maintenanceCount, color: "#EF4444" },
  ];

  // 2. Financial Invoiced vs Collected by Building
  const financeByBuilding = buildings.map((b) => {
    const bInvoices = storageService.getInvoices({ buildingId: b.id });
    const invoiced = bInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const collected = bInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const debt = bInvoices.reduce((sum, i) => sum + i.balanceRemaining, 0);

    return {
      name: b.name.split("-")[0].trim(),
      "Đã lập hóa đơn": invoiced,
      "Thực thu": collected,
      "Công nợ": debt,
    };
  });

  // Overall totals
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalDebt = invoices.reduce((sum, i) => sum + i.balanceRemaining, 0);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Báo cáo Hiệu suất & Tài chính</h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Phân tích tỷ lệ lấp đầy, đối chiếu doanh thu hóa đơn và thực thu SePay toàn chuỗi
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Tỷ lệ thu hồi nợ</span>
          <div className="text-2xl font-bold text-teal-800 mt-2 tabular-nums">{collectionRate}%</div>
          <p className="text-xs text-slate-400 mt-1">Tỷ lệ thực thu / tổng hóa đơn</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Tổng tiền đã xuất HĐ</span>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{formatCurrencyVND(totalInvoiced)}</div>
          <p className="text-xs text-slate-400 mt-1">Bao gồm tiền phòng & điện nước</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Tiền thực thu</span>
          <div className="text-2xl font-bold text-emerald-700 mt-2 tabular-nums">{formatCurrencyVND(totalCollected)}</div>
          <p className="text-xs text-slate-400 mt-1">Đã vào tài khoản ngân hàng</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Công nợ tồn đọng</span>
          <div className="text-2xl font-bold text-rose-600 mt-2 tabular-nums">{formatCurrencyVND(totalDebt)}</div>
          <p className="text-xs text-slate-400 mt-1">Khoản tiền chưa thanh toán</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart: Revenue comparison */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
            So sánh Lập Hóa đơn vs Thực thu theo Từng Cơ sở
          </h3>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeByBuilding} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Tr`}
                />
                <Tooltip
                  formatter={(val: any) => formatCurrencyVND(val)}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "11px" }}
                />
                <Legend />
                <Bar dataKey="Đã lập hóa đơn" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Thực thu" fill="#0F766E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Công nợ" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart: Room status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Cơ cấu Tình trạng Phòng
          </h3>

          <div className="h-56 w-full text-xs my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {roomStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs border-t border-slate-100 pt-3">
            {roomStatusData.map((s) => (
              <div key={s.name} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                  {s.name}
                </span>
                <span className="font-bold text-slate-900 tabular-nums">{s.value} phòng</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
