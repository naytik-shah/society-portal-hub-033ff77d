import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import * as apiService from "@/services/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const ResidentServiceRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useApp();
  const { toast } = useToast();

  const providerIdParam = searchParams.get("providerId");
  const [providerId, setProviderId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (providerIdParam) {
      const parsed = Number(providerIdParam);
      if (!isNaN(parsed)) {
        setProviderId(parsed);
      }
    }
  }, [providerIdParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !providerId || !description.trim()) {
      toast({ title: "Error", description: "Provider and description are required", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.createServiceRequest({
        provider_id: providerId,
        resident_id: user.id,
        description: description.trim(),
      });

      if (response.success) {
        toast({ title: "Request Sent", description: "Service request sent successfully" });
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

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Provider ID</label>
            <Input value={providerId || ""} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your request"
              required
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isLoading || !providerId}>
            {isLoading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>

        {!providerId && (
          <div className="mt-4 rounded-lg border bg-yellow-50 p-3 text-sm text-yellow-800">No provider selected. Please go back to Home Services and choose a provider first.</div>
        )}
      </main>
    </div>
  );
};

export default ResidentServiceRequest;
