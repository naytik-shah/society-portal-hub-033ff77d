import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import { UserPlus, ClipboardList, ShieldCheck, Users, Phone, Home, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getResidents } from "@/services/api";

interface Resident {
  id: number;
  name: string;
  flat_number: string | null;
  phone: string | null;
}

const SecurityDashboard = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (getResidents() as Promise<any>)
      .then((r) => setResidents(r.residents || []))
      .catch(() => setResidents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = residents.filter((r) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      (r.flat_number ?? "").toLowerCase().includes(q) ||
      (r.phone ?? "").includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
        </div>

        {/* Quick-action cards */}
        <div className="grid gap-6 sm:grid-cols-2 mb-10">
          <DashboardCard
            title="Add Visitor"
            description="Register a new visitor entry"
            icon={UserPlus}
            to="/security/add-visitor"
          />
          <DashboardCard
            title="View Visitor Log"
            description="See all visitor records"
            icon={ClipboardList}
            to="/security/visitor-log"
          />
        </div>

        {/* ── Residents Directory ───────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Residents Directory</CardTitle>
            </div>
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, flat…"
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading residents…</div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                {search ? "No residents match your search." : "No residents registered yet."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resident Name</TableHead>
                      <TableHead>
                        <span className="flex items-center gap-1">
                          <Home className="h-3.5 w-3.5" /> Flat No.
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" /> Phone
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>
                          {r.flat_number ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5">
                              {r.flat_number}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50 italic text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {r.phone ? (
                            <a
                              href={`tel:${r.phone}`}
                              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              {r.phone}
                            </a>
                          ) : (
                            <span className="text-muted-foreground/50 italic text-xs">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SecurityDashboard;
