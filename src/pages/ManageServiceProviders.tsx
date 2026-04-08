import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Wrench, Phone, Eye, Zap, Droplets, UserCheck,
  Car, Bug, CookingPot, Plus, X, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getAllProvidersAnyStatus, registerProvider } from "@/services/api";

// ─── Service type config ──────────────────────────────────────────────────────
const SERVICE_TYPES = [
  "Electrician", "Plumber", "Maid", "Driver", "Pest Control", "Cook",
  "Carpenter", "Painter", "Gardener", "Security", "Other",
];

const serviceIcons: Record<string, React.ElementType> = {
  Electrician: Zap, Plumber: Droplets, Maid: UserCheck,
  Driver: Car, "Pest Control": Bug, Cook: CookingPot,
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Provider {
  id: number; name: string; phone: string; service_type: string;
  email: string; description: string; status: string;
  rating: number; created_at: string;
}

interface FormData {
  name: string; service_type: string; phone: string;
  email: string; password: string; description: string;
}
const emptyForm: FormData = {
  name: "", service_type: "Electrician", phone: "",
  email: "", password: "", description: "",
};

// ─── Status helpers ───────────────────────────────────────────────────────────
const statusConfig = {
  approved: { label: "Approved", variant: "default" as const, icon: CheckCircle2, color: "text-green-600" },
  pending:  { label: "Pending Approval", variant: "secondary" as const, icon: Clock, color: "text-amber-600" },
  rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
};

// ─── Component ────────────────────────────────────────────────────────────────
const ManageServiceProviders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await (getAllProvidersAnyStatus() as Promise<any>);
      setProviders(data.providers || []);
    } catch {
      toast({ title: "Error", description: "Could not load providers.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.password) {
      toast({ title: "Validation", description: "Name, phone, email and password are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await (registerProvider({
        name: form.name, service_type: form.service_type,
        phone: form.phone, email: form.email,
        password: form.password, description: form.description,
      }) as Promise<any>);
      toast({
        title: "Provider Submitted",
        description: "Provider registered and pending admin approval. They will be notified once approved.",
      });
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to register provider.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Service Provider Management</h1>
              <p className="text-sm text-muted-foreground">
                Submit providers for admin approval. Once approved, they can log in and accept requests.
              </p>
            </div>
          </div>
          <Button onClick={() => { setForm(emptyForm); setShowModal(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Provider
          </Button>
        </div>

        {/* Providers table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Provider List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
            ) : providers.length === 0 ? (
              <div className="py-16 text-center">
                <Wrench className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No providers yet. Add your first provider!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((p) => {
                      const Icon = serviceIcons[p.service_type] || Wrench;
                      const sc = statusConfig[p.status as keyof typeof statusConfig] ?? statusConfig.pending;
                      const StatusIcon = sc.icon;
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.phone}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-primary" />
                              {p.service_type}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={sc.variant} className="flex items-center gap-1 w-fit">
                              <StatusIcon className={`h-3 w-3 ${sc.color}`} />
                              {sc.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" title="View details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {p.status === "approved" && (
                                <Button variant="ghost" size="icon" title="Call" asChild>
                                  <a href={`tel:${p.phone}`}>
                                    <Phone className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Provider Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border rounded-xl p-6 w-full max-w-md shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">Register Service Provider</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submitted providers need admin approval before they can log in.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rahul Sharma" />
              </div>

              {/* Service Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Service Type <span className="text-destructive">*</span>
                </label>
                <select
                  value={form.service_type}
                  onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 9876543210" />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="provider@example.com" />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Login Password <span className="text-destructive">*</span>
                  <span className="font-normal ml-1 text-muted-foreground/70">(set for the provider's account)</span>
                </label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description about the provider (optional)"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>

              {/* Info banner */}
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  After submission, an admin must approve this provider before they can log in and accept service requests.
                </span>
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Submitting…" : "Submit for Approval"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServiceProviders;
