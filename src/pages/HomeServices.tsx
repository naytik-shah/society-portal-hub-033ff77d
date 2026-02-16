import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Droplets, UserCheck, Car } from "lucide-react";

const providers = [
  { category: "Electrician", icon: Zap, people: [{ name: "Ramesh Kumar", phone: "9876500001" }, { name: "Sunil Yadav", phone: "9876500002" }] },
  { category: "Plumber", icon: Droplets, people: [{ name: "Manoj Jha", phone: "9876500003" }, { name: "Deepak Tiwari", phone: "9876500004" }] },
  { category: "Maid", icon: UserCheck, people: [{ name: "Sunita Devi", phone: "9876500005" }, { name: "Kamla Bai", phone: "9876500006" }] },
  { category: "Driver", icon: Car, people: [{ name: "Rajesh Chauhan", phone: "9876500007" }, { name: "Anil Sharma", phone: "9876500008" }] },
];

const HomeServices = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <button onClick={() => navigate("/resident")} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <h1 className="mb-6 text-2xl font-bold">Home Service Providers</h1>
        <div className="grid gap-6 sm:grid-cols-2">
          {providers.map((cat) => (
            <div key={cat.category} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <cat.icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">{cat.category}</h2>
              </div>
              <ul className="space-y-3">
                {cat.people.map((p) => (
                  <li key={p.phone} className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
                    <span className="font-medium text-sm">{p.name}</span>
                    <span className="text-sm text-muted-foreground">{p.phone}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomeServices;
