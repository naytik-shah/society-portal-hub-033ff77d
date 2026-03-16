import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Droplets, UserCheck, Car, Bug, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as apiService from "@/services/api";

interface ServiceProvider {
  id: number;
  name: string;
  service_type: string;
  phone: string;
  email: string;
  rating: number;
  description: string;
}

const serviceIcons: Record<string, any> = {
  Electrician: Zap,
  Plumber: Droplets,
  Maid: UserCheck,
  Driver: Car,
  "Pest Control": Bug,
  Cook: ChefHat,
};

const HomeServices = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getAllProviders();
        if (response.success) {
          setProviders(response.providers || []);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load service providers",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [toast]);

  // Group providers by service type
  const groupedProviders = providers.reduce((acc, provider) => {
    const serviceType = provider.service_type;
    if (!acc[serviceType]) {
      acc[serviceType] = [];
    }
    acc[serviceType].push(provider);
    return acc;
  }, {} as Record<string, ServiceProvider[]>);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <button
          onClick={() => navigate("/resident")}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <h1 className="mb-6 text-2xl font-bold">Home Service Providers</h1>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading service providers...</div>
        ) : Object.keys(groupedProviders).length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {Object.entries(groupedProviders).map(([serviceType, serviceProviders]) => {
              const IconComponent = serviceIcons[serviceType] || Zap;
              return (
                <div key={serviceType} className="rounded-xl border bg-card p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold">{serviceType}</h2>
                  </div>
                  <ul className="space-y-3">
                    {serviceProviders.map((provider) => (
                      <li key={provider.id} className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
                        <div className="flex-1">
                          <span className="font-medium text-sm block">{provider.name}</span>
                          <span className="text-xs text-muted-foreground">{provider.phone}</span>
                        </div>
                        <span className="text-sm font-semibold text-yellow-600">★ {provider.rating.toFixed(1)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">No service providers found</div>
        )}
      </main>
    </div>
  );
};

export default HomeServices;
