import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { ArrowLeft, UserCircle, Phone, Wrench, BadgeCheck, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import * as apiService from "@/services/api";

interface ProviderData {
  id?: number;
  name: string;
  phone: string;
  email: string;
  service_type: string;
  description: string;
  rating: number;
}

const ProviderProfile = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { toast } = useToast();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setIsLoading(true);
        if (user?.id) {
          const response = await apiService.getProviderById(user.id);
          if (response.success) {
            setProvider(response.provider);
          } else {
            // If not found as provider, use user data
            setProvider({
              name: user.name,
              phone: "",
              email: user.email,
              service_type: "Service Provider",
              description: "Professional service provider",
              rating: 4.5,
            });
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
        // Fallback to user data
        if (user) {
          setProvider({
            name: user.name,
            phone: "",
            email: user.email,
            service_type: "Service Provider",
            description: "Professional service provider",
            rating: 4.5,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvider();
  }, [user, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="text-center py-12 text-muted-foreground">Loading profile...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/provider")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <h1 className="mb-6 text-2xl font-bold">My Profile</h1>

        {provider ? (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <UserCircle className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{provider.name}</h2>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-medium">{provider.rating.toFixed(1)} Rating</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{provider.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Service Type</p>
                    <p className="font-medium">{provider.service_type}</p>
                  </div>
                </div>
              </div>

              {provider.description && (
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="font-medium">{provider.description}</p>
                </div>
              )}

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{provider.email}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No profile information found
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ProviderProfile;
