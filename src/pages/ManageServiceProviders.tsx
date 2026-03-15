import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wrench, Phone, Eye, Zap, Droplets, UserCheck, Car, Bug, CookingPot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const serviceTypes = ["Electrician", "Plumber", "Maid", "Driver", "Pest Control", "Cook"] as const;

const serviceIcons: Record<string, React.ElementType> = {
  Electrician: Zap,
  Plumber: Droplets,
  Maid: UserCheck,
  Driver: Car,
  "Pest Control": Bug,
  Cook: CookingPot,
};

interface Provider {
  name: string;
  phone: string;
  service: string;
  status: "Available" | "Busy";
}

const dummyProviders: Provider[] = [
  { name: "Rajesh Sharma", phone: "9876543210", service: "Electrician", status: "Available" },
  { name: "Suresh Patil", phone: "9123456780", service: "Plumber", status: "Busy" },
  { name: "Meena Joshi", phone: "9988776655", service: "Maid", status: "Available" },
  { name: "Arun Singh", phone: "9765432109", service: "Driver", status: "Available" },
  { name: "Ravi Desai", phone: "9001122334", service: "Pest Control", status: "Busy" },
  { name: "Lata Kumari", phone: "9334455667", service: "Cook", status: "Available" },
];

const ManageServiceProviders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>(dummyProviders);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !service) return;
    setProviders((prev) => [{ name, phone, service, status: "Available" }, ...prev]);
    setName("");
    setPhone("");
    setService("");
    toast({ title: "Provider Added", description: `${name} has been added as ${service}.` });
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

        {/* Add Provider Form */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="text-lg">Add Service Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input placeholder="Provider Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input placeholder="Phone Number" type="number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <Select value={service} onValueChange={setService}>
                <SelectTrigger>
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full">Add Provider</Button>
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
                  const Icon = serviceIcons[p.service] || Wrench;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.phone}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          {p.service}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.status === "Available" ? "default" : "secondary"}>
                          {p.status}
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
