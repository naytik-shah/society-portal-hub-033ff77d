import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const VisitorLog = () => {
  const { visitors, loadVisitors } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setIsLoading(true);
        await loadVisitors();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load visitors",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitors();
  }, [loadVisitors, toast]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
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
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="mb-6 text-2xl font-bold">Visitor Log</h1>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading visitors...</div>
        ) : visitors && visitors.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Flat No.</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  <TableHead>Check-out Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.phone}</TableCell>
                    <TableCell>{v.purpose}</TableCell>
                    <TableCell>{v.flat_number}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(v.check_in_time || "")}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {v.check_out_time ? formatDate(v.check_out_time) : "Still inside"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">No visitors found</div>
        )}
      </main>
    </div>
  );
};

export default VisitorLog;
