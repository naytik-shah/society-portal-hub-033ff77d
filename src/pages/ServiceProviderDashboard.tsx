import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import { Wrench, ClipboardList, CalendarClock, UserCircle } from "lucide-react";

const ServiceProviderDashboard = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Wrench className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Service Provider Dashboard</h1>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="My Profile" description="View your provider profile" icon={UserCircle} to="/provider/profile" />
        <DashboardCard title="Service Requests" description="View resident service requests" icon={ClipboardList} to="/provider/requests" />
        <DashboardCard title="My Schedule" description="Upcoming service bookings" icon={CalendarClock} to="/provider/schedule" />
      </div>
    </main>
  </div>
);

export default ServiceProviderDashboard;
