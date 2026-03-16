import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AddVisitor = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [flat, setFlat] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addVisitor } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !purpose || !flat) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addVisitor({
        name,
        phone,
        purpose,
        flat_number: flat,
      });

      toast({
        title: "Success",
        description: "Visitor added successfully!",
      });

      navigate("/security/visitor-log");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add visitor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-12">
        <button
          onClick={() => navigate("/security")}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <h1 className="mb-6 text-2xl font-bold">Add Visitor</h1>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-card p-8 shadow-sm">
          <div className="space-y-2">
            <Label>Visitor Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit number"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label>Purpose of Visit</Label>
            <Input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Delivery, Guest"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label>Flat Number</Label>
            <Input
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
              placeholder="e.g. A-101"
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Adding..." : "Submit"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default AddVisitor;
