import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const myVisitors = [
  { name: "Rahul Sharma", phone: "9876543210", purpose: "Delivery", dateTime: "2026-02-15 10:30 AM" },
  { name: "Priya Mehta", phone: "9123456789", purpose: "Guest Visit", dateTime: "2026-02-14 11:45 AM" },
  { name: "Courier Boy", phone: "9988776655", purpose: "Courier", dateTime: "2026-02-13 03:15 PM" },
];

const MyVisitors = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <button onClick={() => navigate("/resident")} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <h1 className="mb-6 text-2xl font-bold">My Visitors</h1>
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myVisitors.map((v, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.phone}</TableCell>
                  <TableCell>{v.purpose}</TableCell>
                  <TableCell className="text-muted-foreground">{v.dateTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default MyVisitors;
