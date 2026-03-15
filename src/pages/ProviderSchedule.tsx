import Navbar from "@/components/Navbar";
import { ArrowLeft, CalendarClock, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const schedule = [
  { flat: "B-203", service: "Plumbing Repair", time: "10:30 AM", date: "Today" },
  { flat: "A-102", service: "Electrical Wiring", time: "2:00 PM", date: "Today" },
  { flat: "C-401", service: "Fan Installation", time: "11:00 AM", date: "Tomorrow" },
  { flat: "D-105", service: "Pipe Leakage Fix", time: "4:30 PM", date: "Tomorrow" },
  { flat: "A-302", service: "Socket Repair", time: "9:00 AM", date: "18 Mar 2026" },
];

const ProviderSchedule = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/provider")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="mb-6 flex items-center gap-3">
          <CalendarClock className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">My Schedule</h1>
        </div>

        <div className="space-y-4">
          {schedule.map((s, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <p className="font-semibold">{s.service}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Flat {s.flat}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {s.time}
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {s.date}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProviderSchedule;
