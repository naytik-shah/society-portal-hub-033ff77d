import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { ArrowLeft, ClipboardList, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import * as apiService from "@/services/api";

interface ServiceRequest {
  id: number;
  provider_id: number | null;
  resident_id: number;
  service_type: string;
  description: string;
  status: string;
  created_at: string;
}

// Helper: normalize role to DB value for comparison
function isProvider(role?: string) {
  if (!role) return false;
  const r = role.toUpperCase();
  return r === "PROVIDER" || r === "SERVICE PROVIDER";
}

function isResident(role?: string) {
  if (!role) return false;
  return role.toUpperCase() === "RESIDENT";
}

const statusColor = (s: string) => {
  const upper = s.toUpperCase();
  if (upper === "OPEN") return "destructive";
  if (upper === "ACCEPTED") return "default";
  if (upper === "COMPLETED") return "secondary";
  return "secondary";
};

const ServiceRequests = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      if (!user?.id || !user.role) {
        setRequests([]);
        return;
      }

      let response: any = null;

      if (isProvider(user.role)) {
        // Provider: fetch open requests + requests assigned to them
        response = await apiService.getServiceRequests(user.id, undefined);
      } else if (isResident(user.role)) {
        // Resident: fetch only their own requests
        response = await apiService.getServiceRequests(undefined, user.id);
      }

      if (response?.success) {
        setRequests(response.requests || []);
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

  useEffect(() => {
    fetchRequests();
  }, [user]);

  // Provider accepts a request
  const handleAccept = async (requestId: number) => {
    if (!user?.id) return;

    try {
      setAcceptingId(requestId);
      const response = await apiService.acceptServiceRequest(requestId, user.id) as any;

      if (response.success) {
        toast({ title: "Request Accepted", description: `You accepted request #${requestId}` });
        // Refresh the list
        await fetchRequests();
      } else {
        throw new Error(response.message || "Failed to accept request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept request",
        variant: "destructive",
      });
    } finally {
      setAcceptingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN");
    } catch {
      return dateString;
    }
  };

  const backPath = isProvider(user?.role) ? "/provider" : "/resident";
  const userIsProvider = isProvider(user?.role);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(backPath)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="mb-6 flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Service Requests</h1>
        </div>

        {/* Show logged-in context */}
        {user && (
          <div className="mb-4 rounded-lg border bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Logged in as: <strong>{user.name}</strong> (ID: {user.id}, Role: {user.role})
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading service requests...</div>
        ) : requests.length > 0 ? (
          <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {userIsProvider && <TableHead className="text-right">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">#{r.id}</TableCell>
                    <TableCell>{r.service_type || "—"}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>{formatDate(r.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor(r.status)}>
                        {r.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    {userIsProvider && (
                      <TableCell className="text-right">
                        {r.status.toUpperCase() === "OPEN" ? (
                          <Button
                            size="sm"
                            onClick={() => handleAccept(r.id)}
                            disabled={acceptingId === r.id}
                          >
                            {acceptingId === r.id ? "Accepting..." : (
                              <><CheckCircle2 className="mr-1 h-3 w-3" /> Accept</>
                            )}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {r.status.toUpperCase() === "ACCEPTED" ? "Accepted" : r.status}
                          </span>
                        )}
                      </TableCell>
                    )}
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
