import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import * as api from "@/services/api";

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string | null;
  location: string;
  created_by_name: string;
}

const SocietyEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (api.adminGetEvents() as Promise<any>)
      .then((r) => setEvents(r.events || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isUpcoming = (d: string) => new Date(d) >= new Date();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <button onClick={() => navigate("/resident")} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <h1 className="mb-6 text-2xl font-bold">Society Events</h1>

        {loading ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No events scheduled yet.</div>
        ) : (
          <div className="space-y-4">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{ev.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isUpcoming(ev.event_date) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {isUpcoming(ev.event_date) ? "Upcoming" : "Past"}
                    </span>
                  </div>
                  {ev.description && <p className="mt-1 text-sm text-muted-foreground">{ev.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(ev.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    {ev.event_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {ev.event_time.slice(0, 5)}
                      </span>
                    )}
                    {ev.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SocietyEvents;
