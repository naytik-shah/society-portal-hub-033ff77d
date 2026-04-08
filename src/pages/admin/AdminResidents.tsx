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
import { Users, Plus, Pencil, Trash2, X } from "lucide-react";

interface Resident {
  id: number; username: string; email: string; name: string;
  phone: string | null; flat_number: string | null; created_at: string;
}
interface FormData {
  name: string; email: string; username: string; password: string;
  phone: string; flat_number: string;
}
const empty: FormData = { name: "", email: "", username: "", password: "", phone: "", flat_number: "" };

const FIELDS = [
  { key: "name",        label: "Full Name",    type: "text",     required: true  },
  { key: "username",    label: "Username",     type: "text",     required: true  },
  { key: "email",       label: "Email",        type: "email",    required: true  },
  { key: "password",    label: "Password",     type: "password", required: false }, // only for create
  { key: "phone",       label: "Phone Number", type: "tel",      required: false },
  { key: "flat_number", label: "Flat Number",  type: "text",     required: false },
];

const AdminResidents = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [residents, setResidents] = useState<Resident[]>([]);
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
      const r = await (api.adminGetResidents() as Promise<any>);
      setResidents(r.residents || []);
    } catch { toast({ title: "Error", description: "Failed to load residents", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditId(null); setForm(empty); setShowModal(true); };
  const openEdit = (r: Resident) => {
    setEditId(r.id);
    setForm({
      name: r.name, email: r.email, username: r.username,
      password: "", phone: r.phone || "", flat_number: r.flat_number || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.username || (!editId && !form.password)) {
      toast({ title: "Validation", description: "Name, username, email and password (on create) are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await (api.adminUpdateResident(editId, {
          name: form.name, email: form.email, username: form.username,
          phone: form.phone || undefined, flat_number: form.flat_number || undefined,
        }) as Promise<any>);
        toast({ title: "Updated", description: "Resident updated" });
      } else {
        await (api.adminCreateResident({
          name: form.name, email: form.email, username: form.username,
          password: form.password, phone: form.phone || undefined,
          flat_number: form.flat_number || undefined,
        }) as Promise<any>);
        toast({ title: "Created", description: "Resident created successfully" });
      }
      setShowModal(false);
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this resident? This cannot be undone.")) return;
    try {
      await (api.adminDeleteResident(id) as Promise<any>);
      toast({ title: "Deleted", description: "Resident removed" });
      load();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  // Fields to show in modal (hide password on edit)
  const modalFields = editId
    ? FIELDS.filter((f) => f.key !== "password")
    : FIELDS;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Residents</h1>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg">All Residents ({residents.length})</CardTitle>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Resident
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
                      <TableHead>Flat No.</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {residents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No residents found</TableCell>
                      </TableRow>
                    ) : residents.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>{r.username}</TableCell>
                        <TableCell className="text-muted-foreground">{r.email}</TableCell>
                        <TableCell>{r.flat_number || <span className="text-muted-foreground/50 italic text-xs">—</span>}</TableCell>
                        <TableCell className="text-muted-foreground">{r.phone || <span className="text-muted-foreground/50 italic text-xs">—</span>}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editId ? "Edit Resident" : "Add Resident"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {modalFields.map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                  <Input
                    type={type}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editId ? "Save Changes" : "Create Resident"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminResidents;
