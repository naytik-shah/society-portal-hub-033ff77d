import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import { Users, Wrench, CalendarDays, Home, Settings, ClipboardList } from "lucide-react";

const ResidentDashboard = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Home className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Resident Dashboard</h1>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="My Visitors" description="View your visitor history" icon={Users} to="/resident/my-visitors" />
        <DashboardCard title="Home Services" description="Find service providers" icon={Wrench} to="/resident/services" />
        <DashboardCard title="My Service Requests" description="View your service requests" icon={ClipboardList} to="/resident/requests" />
        <DashboardCard title="Society Events" description="Upcoming community events" icon={CalendarDays} to="/resident/events" />
        <DashboardCard title="Manage Service Providers" description="Add and view service providers" icon={Settings} to="/resident/manage-providers" />
      </div>
    </main>
  </div>
);

export default ResidentDashboard;
