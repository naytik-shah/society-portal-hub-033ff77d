import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Visitor {
  name: string;
  phone: string;
  purpose: string;
  flat: string;
  dateTime: string;
}

interface AppContextType {
  role: string | null;
  setRole: (role: string | null) => void;
  visitors: Visitor[];
  addVisitor: (v: Omit<Visitor, "dateTime">) => void;
}

const dummyVisitors: Visitor[] = [
  { name: "Rahul Sharma", phone: "9876543210", purpose: "Delivery", flat: "A-101", dateTime: "2026-02-15 10:30 AM" },
  { name: "Priya Mehta", phone: "9123456789", purpose: "Guest Visit", flat: "B-204", dateTime: "2026-02-15 11:45 AM" },
  { name: "Amit Verma", phone: "9988776655", purpose: "Maintenance", flat: "C-302", dateTime: "2026-02-14 03:15 PM" },
  { name: "Sunita Rao", phone: "9001122334", purpose: "Courier", flat: "A-405", dateTime: "2026-02-14 09:00 AM" },
  { name: "Vikram Singh", phone: "9112233445", purpose: "Guest Visit", flat: "D-102", dateTime: "2026-02-13 06:30 PM" },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<string | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>(dummyVisitors);

  const addVisitor = (v: Omit<Visitor, "dateTime">) => {
    const now = new Date();
    const dateTime = now.toLocaleString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true });
    setVisitors((prev) => [{ ...v, dateTime }, ...prev]);
  };

  return (
    <AppContext.Provider value={{ role, setRole, visitors, addVisitor }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
