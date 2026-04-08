import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useApp } from "@/context/AppContext";
import * as api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Plus, Pencil, Trash2, X } from "lucide-react";

interface Guard { id: number; username: string; email: string; name: string; created_at: string; }
interface FormData { name: string; email: string; username: string; password: string; }
const empty: FormData = { name: "", email: "", username: "", password: "" };

const AdminGuards = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { navigate("/"); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await (api.adminGetGuards() as Promise<any>);
      setGuards(r.guards || []);
    } catch { toast({ title: "Error", description: "Failed to load guards", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditId(null); setForm(empty); setShowModal(true); };
  const openEdit = (g: Guard) => {
    setEditId(g.id);
    setForm({ name: g.name, email: g.email, username: g.username, password: "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.username || (!editId && !form.password)) {
      toast({ title: "Validation", description: "All fields are required", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      if (editId) {
        await (api.adminUpdateGuard(editId, { name: form.name, email: form.email, username: form.username }) as Promise<any>);
        toast({ title: "Updated", description: "Guard updated" });
      } else {
        await (api.adminCreateGuard(form) as Promise<any>);
        toast({ title: "Created", description: "Guard created" });
      }
      setShowModal(false); load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this guard?")) return;
    try {
      await (api.adminDeleteGuard(id) as Promise<any>);
      toast({ title: "Deleted", description: "Guard removed" });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Security Guards</h1>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg">All Guards ({guards.length})</CardTitle>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Guard
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-muted-foreground text-sm">Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guards.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No guards found</TableCell></TableRow>
                    ) : guards.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">{g.name}</TableCell>
                        <TableCell>{g.username}</TableCell>
                        <TableCell className="text-muted-foreground">{g.email}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(g.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(g.id)}><Trash2 className="h-4 w-4" /></Button>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editId ? "Edit Guard" : "Add Guard"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-3">
              {["name", "username", "email", ...(!editId ? ["password"] : [])].map((field) => (
                <div key={field}>
                  <label className="text-xs font-medium text-muted-foreground block mb-1 capitalize">{field}</label>
                  <Input
                    type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                    value={(form as any)[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    placeholder={`Enter ${field}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editId ? "Save Changes" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminGuards;
