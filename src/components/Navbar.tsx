import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { role, setRole } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    setRole(null);
    navigate("/");
  };

  const dashboardPath = role === "Security" ? "/security" : "/resident";

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <button onClick={() => navigate(dashboardPath)} className="flex items-center gap-2 font-bold text-lg text-primary">
          <Building2 className="h-6 w-6" />
          <span>Sentrigate</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Logged in as <strong className="text-foreground">{role}</strong>
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </nav>);

};

export default Navbar;