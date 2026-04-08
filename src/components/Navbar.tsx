import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { user, role, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardPath =
    role === "Security" ? "/security" :
    role === "Service Provider" ? "/provider" :
    role === "ADMIN" || user?.role === "ADMIN" ? "/admin" :
    "/resident";

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <button
          onClick={() => navigate(dashboardPath)}
          className="flex items-center gap-2 font-bold text-lg text-primary"
        >
          <img src={logo} alt="Sentrigate Logo" className="h-8 w-8 rounded-full object-contain" />
          <span>Sentrigate</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-sm">
            <span className="text-xs text-muted-foreground">Logged in as</span>
            <strong className="text-foreground">{user?.name || role || "User"}</strong>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;