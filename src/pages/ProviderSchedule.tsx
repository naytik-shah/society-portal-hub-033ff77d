import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { ArrowLeft, CalendarClock, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import * as apiService from "@/services/api";

interface Schedule {
  id: number;
  provider_id: number;
  schedule_date: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

const ProviderSchedule = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        if (user?.id) {
          const response = await apiService.getProviderSchedule(user.id);
          if (response.success) {
            setSchedules(response.schedule || []);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load schedule",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [user, toast]);

  const formatTime = (time: string) => {
    if (!time) return "N/A";
    try {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${period}`;
    } catch {
      return time;
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    try {
      const scheduleDate = new Date(date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (scheduleDate.toDateString() === today.toDateString()) {
        return "Today";
      } else if (scheduleDate.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
      } else {
        return scheduleDate.toLocaleDateString("en-IN");
      }
    } catch {
      return date;
    }
  };

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

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading schedule...</div>
        ) : schedules.length > 0 ? (
          <div className="space-y-4">
            {schedules.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex items-center justify-between p-5">
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {formatTime(s.start_time)} - {formatTime(s.end_time)}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Available
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {formatDate(s.schedule_date)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">No schedule found</div>
        )}
      </main>
    </div>
  );
};

export default ProviderSchedule;
