import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";

const events = [
  { title: "Annual General Meeting", date: "March 5, 2026", time: "6:00 PM", location: "Community Hall" },
  { title: "Holi Celebration", date: "March 14, 2026", time: "10:00 AM", location: "Society Garden" },
  { title: "Summer Camp for Kids", date: "April 1, 2026", time: "9:00 AM", location: "Clubhouse" },
  { title: "Maintenance Drive", date: "April 10, 2026", time: "8:00 AM", location: "All Blocks" },
];

const SocietyEvents = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <button onClick={() => navigate("/resident")} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <h1 className="mb-6 text-2xl font-bold">Society Events</h1>
        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev.title} className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{ev.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{ev.date} • {ev.time} • {ev.location}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SocietyEvents;
