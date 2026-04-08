import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useApp } from "@/context/AppContext";
import * as api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Plus, Pencil, Trash2, X, MapPin, Clock } from "lucide-react";

interface Event {
  id: number; title: string; description: string;
  event_date: string; event_time: string | null;
  location: string; created_by_name: string; created_at: string;
}
interface FormData {
  title: string; description: string;
  event_date: string; event_time: string; location: string;
}
const emptyForm: FormData = { title: "", description: "", event_date: "", event_time: "", location: "" };

const AdminEvents = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { navigate("/"); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await (api.adminGetEvents() as Promise<any>);
      setEvents(r.events || []);
    } catch (e: any) {
      toast({ title: "Error", description: "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (e: Event) => {
    setEditId(e.id);
    setForm({
      title: e.title,
      description: e.description || "",
      event_date: e.event_date ? e.event_date.split("T")[0] : "",
      event_time: e.event_time ? e.event_time.slice(0, 5) : "",
      location: e.location || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.event_date) {
      toast({ title: "Validation", description: "Title and date are required", variant: "destructive" });
      return;
    }

    // Ensure we have an admin ID to use as created_by
    const createdBy = user?.id;
    if (!createdBy) {
      toast({ title: "Error", description: "Session expired. Please log in again.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await (api.adminUpdateEvent(editId, {
          title: form.title,
          description: form.description,
          event_date: form.event_date,
          event_time: form.event_time || undefined,
          location: form.location,
        }) as Promise<any>);
        toast({ title: "Updated", description: "Event updated successfully" });
      } else {
        await (api.adminCreateEvent({
          title: form.title,
          description: form.description,
          event_date: form.event_date,
          event_time: form.event_time || undefined,
          location: form.location,
          created_by: createdBy,
        }) as Promise<any>);
        toast({ title: "Created", description: "Event created — residents can now see it" });
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to save event", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    try {
      await (api.adminDeleteEvent(id) as Promise<any>);
      toast({ title: "Deleted", description: "Event removed" });
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const isUpcoming = (d: string) => new Date(d) >= new Date(new Date().toDateString());

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Events</h1>
              <p className="text-sm text-muted-foreground">Events are visible to all residents automatically</p>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-muted-foreground text-sm">Loading…</div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No events yet. Create your first event!</p>
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((e) => (
              <Card key={e.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{e.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isUpcoming(e.event_date)
                          ? "bg-green-100 text-green-700"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {isUpcoming(e.event_date) ? "Upcoming" : "Past"}
                      </span>
                    </div>
                    {e.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(e.event_date).toLocaleDateString("en-IN", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </span>
                      {e.event_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {e.event_time.slice(0, 5)}
                        </span>
                      )}
                      {e.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {e.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(e)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(e.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editId ? "Edit Event" : "Create Event"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Society AGM"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Event Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  className="[color-scheme:light]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Event Time</label>
                <Input
                  type="time"
                  value={form.event_time}
                  onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                  className="[color-scheme:light]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Location</label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Community Hall"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the event (optional)"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editId ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminEvents;
