import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useApp } from "@/context/AppContext";
import * as api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, Shield, UserCheck, CalendarDays,
  ClipboardList, Briefcase, AlertCircle, ShieldCheck,
} from "lucide-react";

interface Stats {
  residents: number; guards: number; providers: number;
  pending_providers: number; visitors: number; events: number; service_requests: number;
}

const StatCard = ({ label, value, icon: Icon, sub, to }: {
  label: string; value: number; icon: React.ElementType; sub?: string; to?: string;
}) => {
  const navigate = useNavigate();
  return (
    <Card
      className={`cursor-default ${to ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all" : ""}`}
      onClick={() => to && navigate(to)}
    >
      <CardContent className="p-5 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-0.5">{value}</p>
          {sub && <p className="text-xs text-amber-600 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { navigate("/"); return; }
    (api.adminGetStats() as Promise<any>)
      .then((r) => setStats(r.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const cards = stats ? [
    { label: "Residents",        value: stats.residents,        icon: Users,        to: "/admin/residents" },
    { label: "Security Guards",  value: stats.guards,           icon: Shield,       to: "/admin/guards" },
    {
      label: "Service Providers", value: stats.providers, icon: UserCheck, to: "/admin/providers",
      sub: stats.pending_providers > 0 ? `${stats.pending_providers} pending approval` : undefined,
    },
    { label: "Visitor Logs",     value: stats.visitors,         icon: ClipboardList, to: "/admin/visitors" },
    { label: "Events",            value: stats.events,           icon: CalendarDays,  to: "/admin/events" },
    { label: "Service Requests",  value: stats.service_requests, icon: Briefcase,     to: "/admin/service-requests" },
  ] : [];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">Loading…</div>
        ) : (
          <>
            {/* Pending alert */}
            {stats && stats.pending_providers > 0 && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  <strong>{stats.pending_providers}</strong> provider{stats.pending_providers > 1 ? "s" : ""} awaiting approval.
                </span>
                <Button
                  size="sm" variant="outline"
                  className="ml-auto text-amber-700 border-amber-300 hover:bg-amber-100"
                  onClick={() => navigate("/admin/providers")}
                >
                  Review →
                </Button>
              </div>
            )}

            {/* Stat grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((c) => <StatCard key={c.label} {...c} value={c.value} sub={(c as any).sub} />)}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
