import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useApp } from "@/context/AppContext";
import * as api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Search } from "lucide-react";

interface ServiceRequest {
  id: number; service_type: string; description: string; status: string;
  created_at: string; updated_at: string;
  resident_name: string; resident_email: string;
  provider_name: string | null; provider_service_type: string | null;
}

const statusVariant = (s: string): "default" | "secondary" | "outline" => {
  if (s === "COMPLETED") return "default";
  if (s === "ACCEPTED") return "secondary";
  return "outline";
};

const AdminServiceRequests = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { navigate("/"); return; }
    (api.adminGetServiceRequests() as Promise<any>)
      .then((r) => setRequests(r.requests || []))
      .catch(() => toast({ title: "Error", description: "Failed to load requests", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [user]);

  const tabs = ["ALL", "OPEN", "ACCEPTED", "COMPLETED"] as const;
  const counts = Object.fromEntries(
    tabs.map((t) => [t, t === "ALL" ? requests.length : requests.filter((r) => r.status === t).length])
  );

  const filtered = requests.filter((r) => {
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.service_type.toLowerCase().includes(q) || r.resident_name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Service Requests</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-9 w-52"
            />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                statusFilter === tab
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {tab} ({counts[tab as keyof typeof counts]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-10 text-center text-muted-foreground text-sm">Loading…</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No requests found</TableCell></TableRow>
                ) : filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground font-mono text-xs">#{r.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{r.service_type}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">{r.description}</div>
                    </TableCell>
                    <TableCell>
                      <div>{r.resident_name}</div>
                      <div className="text-xs text-muted-foreground">{r.resident_email}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.provider_name || <span className="italic text-muted-foreground/60">Unassigned</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminServiceRequests;
