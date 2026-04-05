import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import * as apiService from "@/services/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const serviceTypes = ["Electrician", "Plumber", "Maid", "Driver", "Pest Control", "Cook", "Cleaning", "Transport"] as const;

const ResidentServiceRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useApp();
  const { toast } = useToast();

  const providerIdParam = searchParams.get("providerId");
  const serviceTypeParam = searchParams.get("serviceType");

  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill service type from URL params (passed from HomeServices)
  useEffect(() => {
    if (serviceTypeParam) {
      setServiceType(decodeURIComponent(serviceTypeParam));
    }
  }, [serviceTypeParam]);

  // Block access if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Please login first to create a service request.
          </div>
          <Button className="mt-4" onClick={() => navigate("/")}>Go to Login</Button>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user.id) {
      toast({ title: "Error", description: "User session not found. Please login again.", variant: "destructive" });
      return;
    }

    if (!serviceType || !description.trim()) {
      toast({ title: "Error", description: "Service type and description are required", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);

      // Send request with logged-in user's ID as resident_id
      const response = await apiService.createServiceRequest({
        resident_id: user.id,
        service_type: serviceType,
        description: description.trim(),
      }) as any;

      if (response.success) {
        toast({ title: "Request Created", description: "Your service request has been submitted. Providers can now see and accept it." });
        navigate("/resident/requests");
      } else {
        throw new Error(response.message || "Failed to create service request");
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create request", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/resident/services")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
        </Button>
        <h1 className="text-2xl font-bold mb-4">Request Service</h1>

        {/* Show logged-in user info */}
        <div className="mb-4 rounded-lg border bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Requesting as: <strong>{user.name}</strong> (ID: {user.id})
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Service Type - required */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Service Type *</label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provider ID - optional info */}
          {providerIdParam && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Preferred Provider ID (optional)</label>
              <Input value={providerIdParam} disabled />
              <p className="text-xs text-muted-foreground mt-1">This request will be open for all providers to accept.</p>
            </div>
          )}

          {/* Description - required */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what service you need..."
              required
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isLoading || !serviceType}>
            {isLoading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ResidentServiceRequest;
