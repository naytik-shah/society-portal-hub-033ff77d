import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wrench, Phone, Eye, Zap, Droplets, UserCheck, Car, Bug, CookingPot, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllProviders, addProvider, getProviderById } from "@/services/api";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const serviceIcons: Record<string, React.ElementType> = {
  Electrician: Zap,
  Plumber: Droplets,
  Maid: UserCheck,
  Driver: Car,
  "Pest Control": Bug,
  Cook: CookingPot,
};

interface Provider {
  id?: number;
  name: string;
  phone: string;
  service_type: string;
  email?: string;
  description?: string;
  rating?: number;
  status?: "Available" | "Busy";
}

const ManageServiceProviders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);

  // Verification state
  const [providerId, setProviderId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedProvider, setVerifiedProvider] = useState<Provider | null>(null);
  const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await getAllProviders();
        const providerList = (data as any).providers || (data as any) || [];
        setProviders(providerList);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load providers.",
          variant: "destructive",
        });
      }
    };

    loadProviders();
  }, [toast]);

  // Reset verification when Provider ID changes
  const handleProviderIdChange = (value: string) => {
    setProviderId(value);
    setIsVerified(false);
    setVerifiedProvider(null);
    setVerifyError("");
  };

  // Verify provider by ID
  const handleVerify = async () => {
    const id = parseInt(providerId, 10);
    if (!providerId || isNaN(id) || id <= 0) {
      setVerifyError("Please enter a valid Provider ID (positive number)");
      return;
    }

    setIsVerifying(true);
    setVerifyError("");
    setIsVerified(false);
    setVerifiedProvider(null);

    try {
      const response = await getProviderById(id) as any;

      if (response.success && response.provider) {
        setVerifiedProvider(response.provider);
        setIsVerified(true);
        toast({ title: "Provider Verified", description: `${response.provider.name} found in database.` });
      } else {
        setVerifyError("Invalid Provider ID — provider not found in database.");
      }
    } catch (error) {
      setVerifyError("Invalid Provider ID — provider not found in database.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Add verified provider
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified || !verifiedProvider) {
      toast({ title: "Error", description: "Please verify the provider first.", variant: "destructive" });
      return;
    }

    try {
      await addProvider({
        name: verifiedProvider.name,
        service_type: verifiedProvider.service_type,
        phone: verifiedProvider.phone,
        email: verifiedProvider.email || "",
        description: verifiedProvider.description || "",
        rating: verifiedProvider.rating || 0,
      });

      // Add to local list
      setProviders((prev) => [{ ...verifiedProvider, status: "Available" }, ...prev]);

      // Reset form
      setProviderId("");
      setIsVerified(false);
      setVerifiedProvider(null);
      setVerifyError("");

      toast({ title: "Provider Added", description: `${verifiedProvider.name} has been added as ${verifiedProvider.service_type}.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add provider.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className="mb-8 flex items-center gap-3">
          <Wrench className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Service Provider Management</h1>
        </div>

        {/* Add Provider Form — ID-based verification */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="text-lg">Add Service Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Enter & Verify Provider ID */}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Provider ID</label>
                  <Input
                    placeholder="Enter Provider ID (e.g. 1, 2, 3...)"
                    type="number"
                    min="1"
                    value={providerId}
                    onChange={(e) => handleProviderIdChange(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleVerify}
                  disabled={isVerifying || !providerId}
                  className="shrink-0"
                >
                  {isVerifying ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                  ) : (
                    <><Search className="mr-2 h-4 w-4" /> Verify Provider</>
                  )}
                </Button>
              </div>

              {/* Verification error */}
              {verifyError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {verifyError}
                </div>
              )}

              {/* Step 2: Show auto-filled provider details */}
              {isVerified && verifiedProvider && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Provider Verified Successfully
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Provider Name</label>
                      <Input value={verifiedProvider.name} disabled className="bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Phone Number</label>
                      <Input value={verifiedProvider.phone} disabled className="bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Service Type</label>
                      <Input value={verifiedProvider.service_type} disabled className="bg-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Add verified provider */}
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={!isVerified}
              >
                Add Provider
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Provider List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Provider List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p, i) => {
                  const Icon = serviceIcons[p.service_type] || Wrench;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.phone}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          {p.service_type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.status === "Available" ? "default" : "secondary"}>
                          {p.status ?? "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Call" asChild>
                            <a href={`tel:${p.phone}`}>
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ManageServiceProviders;
