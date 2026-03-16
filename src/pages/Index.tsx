import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Lock, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import * as apiService from "@/services/api";

const Index = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRoleLocal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setRole } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !role) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.login(username, password, role);

      if (response.success) {
        // Store user data in context
        setUser(response.user);
        setRole(role);

        toast({
          title: "Success",
          description: `Welcome, ${response.user.name}!`,
        });

        // Navigate based on role
        if (role === "Security") {
          navigate("/security");
        } else if (role === "Service Provider") {
          navigate("/provider");
        } else {
          navigate("/resident");
        }
      } else {
        toast({
          title: "Login Failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={logo} alt="Sentrigate Logo" className="mx-auto mb-2 h-20 w-20 rounded-full object-contain" />
          <h1 className="text-2xl font-bold text-foreground">Sentrigate</h1>
          <p className="mt-1 text-muted-foreground">Society Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 rounded-xl border bg-card p-8 shadow-lg">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRoleLocal} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Resident">Resident</SelectItem>
                <SelectItem value="Service Provider">Service Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>

          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <p className="font-semibold">Test Credentials:</p>
            <p>Security: security1 / pass123</p>
            <p>Resident: resident1 / pass123</p>
            <p>Provider: provider1 / pass123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Index;
