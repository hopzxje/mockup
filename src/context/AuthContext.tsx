import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { storageService } from "../services/storage";

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<User>) => void;
  demoUsers: { role: UserRole; user: User; label: string; desc: string }[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users = storageService.getUsers();
  
  // Initialize user from saved session or null (entry point is login screen)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem("stayhub_current_user_id");
    if (savedUserId) {
      const found = users.find((u) => u.id === savedUserId);
      if (found) return found;
    }
    return null;
  });

  const demoUsers: { role: UserRole; user: User; label: string; desc: string }[] = [
    {
      role: "ADMIN",
      user: users.find((u) => u.role === "ADMIN")!,
      label: "Admin Chuỗi",
      desc: "Quản trị Tài khoản, Phân quyền, Giám sát & Cấu hình hệ thống",
    },
    {
      role: "MANAGER",
      user: users.find((u) => u.id === "usr-mgr-1") || users.find((u) => u.role === "MANAGER")!,
      label: "Quản lý Cơ sở",
      desc: "Vận hành phòng, cư dân, hợp đồng, hóa đơn & doanh thu",
    },
    {
      role: "STAFF",
      user: users.find((u) => u.id === "usr-staff-1") || users.find((u) => u.role === "STAFF")!,
      label: "Nhân viên Vận hành",
      desc: "Ghi điện nước, bảo trì StayHub Central",
    },
    {
      role: "RESIDENT",
      user: users.find((u) => u.role === "RESIDENT")!,
      label: "Cư dân / Khách thuê",
      desc: "Lê Thị Thu Thảo - Phòng 101 Central",
    },
  ];

  const switchDemoRole = (role: UserRole) => {
    const target = demoUsers.find((d) => d.role === role);
    if (target && target.user) {
      setCurrentUser(target.user);
      localStorage.setItem("stayhub_current_user_id", target.user.id);
    }
  };

  const login = async (email: string, _password?: string): Promise<boolean> => {
    const user = storageService.getUserByEmail(email);
    if (!user) {
      return false;
    }
    if (!user.isActive) {
      throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.");
    }
    setCurrentUser(user);
    localStorage.setItem("stayhub_current_user_id", user.id);
    return true;
  };

  const logout = () => {
    // Revert to demo login prompt or resident
    localStorage.removeItem("stayhub_current_user_id");
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    storageService.updateUser(updated.id, updates);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || "ADMIN",
        isDemoMode: true,
        login,
        logout,
        switchDemoRole,
        updateProfile,
        demoUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
