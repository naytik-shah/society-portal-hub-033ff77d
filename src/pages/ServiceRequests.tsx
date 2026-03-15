import Navbar from "@/components/Navbar";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const requests = [
  { resident: "Anita Desai", flat: "A-101", service: "Wiring Repair", date: "2026-03-15", status: "Pending" },
  { resident: "Mohan Gupta", flat: "B-203", service: "Fan Installation", date: "2026-03-14", status: "Accepted" },
  { resident: "Priya Mehta", flat: "C-302", service: "Socket Replacement", date: "2026-03-13", status: "Completed" },
  { resident: "Vikram Singh", flat: "D-102", service: "Light Fitting", date: "2026-03-12", status: "Pending" },
  { resident: "Sunita Rao", flat: "A-405", service: "MCB Repair", date: "2026-03-11", status: "Completed" },
];

const statusColor = (s: string) =>
  s === "Pending" ? "destructive" : s === "Accepted" ? "default" : "secondary";

const ServiceRequests = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/provider")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="mb-6 flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Service Requests</h1>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resident Name</TableHead>
                <TableHead>Flat Number</TableHead>
                <TableHead>Service Requested</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.resident}</TableCell>
                  <TableCell>{r.flat}</TableCell>
                  <TableCell>{r.service}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(r.status)}>{r.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default ServiceRequests;
