import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const AddVisitor = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [flat, setFlat] = useState("");
  const { addVisitor } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVisitor({ name, phone, purpose, flat });
    navigate("/security/visitor-log");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-12">
        <button onClick={() => navigate("/security")} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <h1 className="mb-6 text-2xl font-bold">Add Visitor</h1>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-card p-8 shadow-sm">
          <div className="space-y-2">
            <Label>Visitor Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" required />
          </div>
          <div className="space-y-2">
            <Label>Purpose of Visit</Label>
            <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Delivery, Guest" required />
          </div>
          <div className="space-y-2">
            <Label>Flat Number</Label>
            <Input value={flat} onChange={(e) => setFlat(e.target.value)} placeholder="e.g. A-101" required />
          </div>
          <Button type="submit" className="w-full" size="lg">Submit</Button>
        </form>
      </main>
    </div>
  );
};

export default AddVisitor;
