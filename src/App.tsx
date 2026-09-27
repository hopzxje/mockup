import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BuildingProvider } from "./context/BuildingContext";
import { AdminLayout } from "./components/layout/AdminLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BuildingsPage } from "./pages/BuildingsPage";
import { AssetsPage } from "./pages/AssetsPage";
import { ResidentsPage } from "./pages/ResidentsPage";
import { ContractsPage } from "./pages/ContractsPage";
import { UtilitiesPage } from "./pages/UtilitiesPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { SePayPage } from "./pages/SePayPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import { VisitorsPage } from "./pages/VisitorsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { UsersPage } from "./pages/UsersPage";
import { SystemSettingsPage } from "./pages/SystemSettingsPage";
import { ProfilePage } from "./pages/ProfilePage";

const AppRoutes: React.FC = () => {
  const { currentUser, currentRole } = useAuth();

  // If not logged in, always show LoginPage as the initial screen
  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If role is RESIDENT, use desktop web layout with resident sidebar & topbar
  if (currentRole === "RESIDENT") {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/visitors" element={<VisitorsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  // If role is ADMIN: ONLY core system governance modules + system dashboard + profile
  if (currentRole === "ADMIN") {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AdminLayout />}>
          {/* Admin System Dashboard */}
          <Route path="/" element={<DashboardPage />} />
          {/* Function 1: Account Management */}
          <Route path="/users" element={<UsersPage />} />
          {/* Function 2: System Monitoring & Audit Logs */}
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          {/* Function 3: System Configuration */}
          <Route path="/system-settings" element={<SystemSettingsPage />} />
          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
          {/* Any other operational route is redirected to Admin Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  // MANAGER & STAFF: Operational management routes
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/buildings" element={<BuildingsPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/residents" element={<ResidentsPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/utilities" element={<UtilitiesPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        {currentRole === "MANAGER" && <Route path="/sepay" element={<SePayPage />} />}
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/visitors" element={<VisitorsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        {currentRole === "MANAGER" && <Route path="/reports" element={<ReportsPage />} />}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BuildingProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </BuildingProvider>
    </AuthProvider>
  );
}
