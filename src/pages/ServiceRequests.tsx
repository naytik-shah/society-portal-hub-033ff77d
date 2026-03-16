import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import * as apiService from "@/services/api";

interface ServiceRequest {
  id: number;
  provider_id: number;
  resident_id: number;
  description: string;
  status: string;
  created_at: string;
}

const statusColor = (s: string) =>
  s === "pending" ? "destructive" : s === "accepted" ? "default" : "secondary";

const ServiceRequests = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        if (user?.id) {
          const response = await apiService.getServiceRequests(user.id);
          if (response.success) {
            setRequests(response.requests || []);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load service requests",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user, toast]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/provider")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="mb-6 flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Service Requests</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading service requests...</div>
        ) : requests.length > 0 ? (
          <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">#{r.id}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>{formatDate(r.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor(r.status)}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">No service requests found</div>
        )}
      </main>
    </div>
  );
};

export default ServiceRequests;
