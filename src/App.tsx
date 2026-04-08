import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Index from "./pages/Index";
import SecurityDashboard from "./pages/SecurityDashboard";
import AddVisitor from "./pages/AddVisitor";
import VisitorLog from "./pages/VisitorLog";
import ResidentDashboard from "./pages/ResidentDashboard";
import MyVisitors from "./pages/MyVisitors";
import HomeServices from "./pages/HomeServices";
import SocietyEvents from "./pages/SocietyEvents";
import ManageServiceProviders from "./pages/ManageServiceProviders";
import ServiceProviderDashboard from "./pages/ServiceProviderDashboard";
import ProviderProfile from "./pages/ProviderProfile";
import ServiceRequests from "./pages/ServiceRequests";
import ResidentServiceRequest from "./pages/ResidentServiceRequest";
import ProviderSchedule from "./pages/ProviderSchedule";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminResidents from "./pages/admin/AdminResidents";
import AdminGuards from "./pages/admin/AdminGuards";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminVisitorLogs from "./pages/admin/AdminVisitorLogs";
import AdminServiceRequests from "./pages/admin/AdminServiceRequests";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />

            {/* Security */}
            <Route path="/security" element={<SecurityDashboard />} />
            <Route path="/security/add-visitor" element={<AddVisitor />} />
            <Route path="/security/visitor-log" element={<VisitorLog />} />

            {/* Resident */}
            <Route path="/resident" element={<ResidentDashboard />} />
            <Route path="/resident/my-visitors" element={<MyVisitors />} />
            <Route path="/resident/services" element={<HomeServices />} />
            <Route path="/resident/events" element={<SocietyEvents />} />
            <Route path="/resident/manage-providers" element={<ManageServiceProviders />} />
            <Route path="/resident/requests" element={<ServiceRequests />} />
            <Route path="/resident/request-service" element={<ResidentServiceRequest />} />

            {/* Provider */}
            <Route path="/provider" element={<ServiceProviderDashboard />} />
            <Route path="/provider/profile" element={<ProviderProfile />} />
            <Route path="/provider/requests" element={<ServiceRequests />} />
            <Route path="/provider/schedule" element={<ProviderSchedule />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/residents" element={<AdminResidents />} />
            <Route path="/admin/guards" element={<AdminGuards />} />
            <Route path="/admin/providers" element={<AdminProviders />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/visitors" element={<AdminVisitorLogs />} />
            <Route path="/admin/service-requests" element={<AdminServiceRequests />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
