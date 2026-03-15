import Navbar from "@/components/Navbar";
import { ArrowLeft, UserCircle, Phone, Wrench, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const providerData = {
  name: "Rajesh Sharma",
  phone: "9876543210",
  serviceType: "Electrician",
  experience: "8 years",
  status: "Available",
};

const ProviderProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/provider")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <h1 className="mb-6 text-2xl font-bold">My Profile</h1>

        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UserCircle className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{providerData.name}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <BadgeCheck className="h-3 w-3" /> {providerData.status}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{providerData.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Wrench className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Service Type</p>
                  <p className="font-medium">{providerData.serviceType}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="font-medium">{providerData.experience}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProviderProfile;
