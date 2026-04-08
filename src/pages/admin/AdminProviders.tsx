import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useApp } from "@/context/AppContext";
import * as api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, CheckCircle2, XCircle, Trash2, Star } from "lucide-react";

interface Provider {
  id: number; user_id: number; name: string; service_type: string;
  phone: string; email: string; description: string; rating: number;
  status: string; created_at: string; username: string;
}

const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "approved") return "default";
  if (s === "rejected") return "destructive";
  return "secondary";
};

const AdminProviders = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { navigate("/"); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await (api.adminGetProviders() as Promise<any>);
      setProviders(r.providers || []);
    } catch { toast({ title: "Error", description: "Failed to load providers", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const approve = async (id: number) => {
    try {
      await (api.adminApproveProvider(id) as Promise<any>);
      toast({ title: "Approved", description: "Provider can now log in" });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const reject = async (id: number) => {
    try {
      await (api.adminRejectProvider(id) as Promise<any>);
      toast({ title: "Rejected", description: "Provider access denied" });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this provider and their account?")) return;
    try {
      await (api.adminDeleteProvider(id) as Promise<any>);
      toast({ title: "Deleted", description: "Provider removed" });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const tabs = ["all", "pending", "approved", "rejected"] as const;
  const counts = Object.fromEntries(
    tabs.map((t) => [t, t === "all" ? providers.length : providers.filter((p) => p.status === t).length])
  );
  const filtered = filter === "all" ? providers : providers.filter((p) => p.status === filter);

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Service Providers</h1>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                filter === tab
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-10 text-center text-muted-foreground text-sm">Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No providers in this category</TableCell></TableRow>
                    ) : filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.email}</div>
                        </TableCell>
                        <TableCell>{p.service_type}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{p.phone}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {p.rating?.toFixed(1) || "0.0"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(p.status)} className="capitalize">{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {p.status !== "approved" && (
                              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => approve(p.id)}>
                                <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                              </Button>
                            )}
                            {p.status !== "rejected" && (
                              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => reject(p.id)}>
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => remove(p.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProviders;
