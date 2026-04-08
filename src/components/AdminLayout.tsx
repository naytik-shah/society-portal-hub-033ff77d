import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Users, Shield, UserCheck,
  CalendarDays, ClipboardList, Briefcase, LogOut, Settings2,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",         href: "/admin",                  icon: LayoutDashboard },
  { label: "Residents",         href: "/admin/residents",        icon: Users },
  { label: "Security Guards",   href: "/admin/guards",           icon: Shield },
  { label: "Providers",         href: "/admin/providers",        icon: UserCheck },
  { label: "Events",            href: "/admin/events",           icon: CalendarDays },
  { label: "Visitor Logs",      href: "/admin/visitors",         icon: ClipboardList },
  { label: "Service Requests",  href: "/admin/service-requests", icon: Briefcase },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { logout, user } = useApp();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 border-r bg-card flex flex-col shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4 border-b">
          <img src={logo} alt="Sentrigate" className="h-8 w-8 rounded-full object-contain" />
          <div>
            <p className="font-bold text-primary text-sm leading-tight">Sentrigate</p>
            <p className="text-[11px] text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(href);
            return (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t space-y-2">
          <div className="flex items-center gap-2 px-1">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
