import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useApp } from "@/context/AppContext";
import * as api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Search } from "lucide-react";

interface Visitor {
  id: number; name: string; phone: string; purpose: string;
  flat_number: string; check_in_time: string; check_out_time: string | null;
}

const AdminVisitorLogs = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { navigate("/"); return; }
    (api.adminGetVisitors() as Promise<any>)
      .then((r) => setVisitors(r.visitors || []))
      .catch(() => toast({ title: "Error", description: "Failed to load logs", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [user]);

  const fmt = (dt: string | null) =>
    dt ? new Date(dt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true }) : "—";

  const filtered = visitors.filter((v) => {
    const q = search.toLowerCase();
    return !q || v.name.toLowerCase().includes(q) || v.flat_number.toLowerCase().includes(q) || (v.purpose || "").toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Visitor Logs</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search visitor, flat…"
              className="pl-9 w-56"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-muted-foreground text-sm">Loading…</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor Name</TableHead>
                  <TableHead>Flat No.</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No visitor records found</TableCell></TableRow>
                ) : filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.flat_number}</TableCell>
                    <TableCell className="text-muted-foreground">{v.purpose || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{v.phone}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{fmt(v.check_in_time)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{fmt(v.check_out_time)}</TableCell>
                    <TableCell>
                      <Badge variant={v.check_out_time ? "secondary" : "default"}>
                        {v.check_out_time ? "Checked Out" : "Inside"}
                      </Badge>
                    </TableCell>
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

export default AdminVisitorLogs;
