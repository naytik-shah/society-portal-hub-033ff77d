import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import { UserPlus, ClipboardList, ShieldCheck } from "lucide-react";

const SecurityDashboard = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Security Dashboard</h1>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <DashboardCard title="Add Visitor" description="Register a new visitor entry" icon={UserPlus} to="/security/add-visitor" />
        <DashboardCard title="View Visitor Log" description="See all visitor records" icon={ClipboardList} to="/security/visitor-log" />
      </div>
    </main>
  </div>
);

export default SecurityDashboard;
