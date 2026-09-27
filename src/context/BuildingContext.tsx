import React, { createContext, useContext, useState, useEffect } from "react";
import { Building } from "../types";
import { storageService } from "../services/storage";
import { useAuth } from "./AuthContext";

interface BuildingContextType {
  buildings: Building[];
  selectedBuildingId: string; // "ALL" or specific building id
  selectedBuilding: Building | null;
  setSelectedBuildingId: (id: string) => void;
  userAccessibleBuildings: Building[];
  refreshBuildings: () => void;
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined);

export const BuildingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>(() => storageService.getBuildings());
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(() => {
    const active = storageService.getBuildings().filter((b) => b.isActive !== false);
    return active[0]?.id || "bld-central";
  });

  const refreshBuildings = () => {
    setBuildings(storageService.getBuildings());
  };

  // Filter accessible buildings based on role (only active buildings)
  const userAccessibleBuildings = buildings.filter((b) => {
    if (!currentUser) return false;
    if (b.isActive === false) return false;
    if (currentUser.role === "ADMIN" || currentUser.role === "MANAGER") return true;
    return currentUser.assignedBuildingIds.includes(b.id) || b.managerId === currentUser.id;
  });

  // Keep selectedBuildingId valid when role/user changes
  useEffect(() => {
    if (!currentUser) return;
    if (userAccessibleBuildings.length > 0) {
      if (!userAccessibleBuildings.some((b) => b.id === selectedBuildingId)) {
        setSelectedBuildingId(userAccessibleBuildings[0].id);
      }
    } else {
      setSelectedBuildingId("NONE");
    }
  }, [currentUser, buildings]);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId) || null;

  return (
    <BuildingContext.Provider
      value={{
        buildings,
        selectedBuildingId,
        selectedBuilding,
        setSelectedBuildingId,
        userAccessibleBuildings,
        refreshBuildings,
      }}
    >
      {children}
    </BuildingContext.Provider>
  );
};

export const useBuilding = () => {
  const context = useContext(BuildingContext);
  if (!context) throw new Error("useBuilding must be used within a BuildingProvider");
  return context;
};
