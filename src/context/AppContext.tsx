import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import * as apiService from "@/services/api";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  name: string;
}

export interface Visitor {
  id?: number;
  name: string;
  phone: string;
  purpose: string;
  flat_number: string;
  check_in_time?: string;
  check_out_time?: string | null;
  created_at?: string;
}

interface AppContextType {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  role: string | null;
  setRole: (role: string | null) => void;
  isLoggedIn: boolean;
  logout: () => void;

  // Visitors
  visitors: Visitor[];
  setVisitors: (visitors: Visitor[]) => void;
  addVisitor: (v: Omit<Visitor, "id" | "check_in_time">) => Promise<void>;
  loadVisitors: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const isLoggedIn = !!user;

  // Load visitors from backend
  const loadVisitors = async () => {
    try {
      const response = await apiService.getAllVisitors();
      if (response.success) {
        setVisitors(response.visitors || []);
      }
    } catch (error) {
      console.error("Error loading visitors:", error);
    }
  };

  // Add visitor to backend
  const addVisitor = async (v: Omit<Visitor, "id" | "check_in_time">) => {
    try {
      const response = await apiService.addVisitor({
        name: v.name,
        phone: v.phone,
        purpose: v.purpose,
        flat_number: v.flat_number,
      });

      if (response.success) {
        // Reload visitors to get updated list
        await loadVisitors();
      } else {
        throw new Error(response.message || "Failed to add visitor");
      }
    } catch (error) {
      console.error("Error adding visitor:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setRole(null);
  };

  // Load visitors on mount
  useEffect(() => {
    loadVisitors();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        role,
        setRole,
        isLoggedIn,
        logout,
        visitors,
        setVisitors,
        addVisitor,
        loadVisitors,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
