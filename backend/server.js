const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

const defaultVisitors = [
  { name: "Rahul Sharma", phone: "9876543210", purpose: "Delivery", flat: "A-101", dateTime: "2026-02-15 10:30 AM" },
  { name: "Priya Mehta", phone: "9123456789", purpose: "Guest Visit", flat: "B-204", dateTime: "2026-02-15 11:45 AM" },
  { name: "Amit Verma", phone: "9988776655", purpose: "Maintenance", flat: "C-302", dateTime: "2026-02-14 03:15 PM" },
  { name: "Sunita Rao", phone: "9001122334", purpose: "Courier", flat: "A-405", dateTime: "2026-02-14 09:00 AM" },
  { name: "Vikram Singh", phone: "9112233445", purpose: "Guest Visit", flat: "D-102", dateTime: "2026-02-13 06:30 PM" },
];

const defaultMyVisitors = [
  { name: "Rahul Sharma", phone: "9876543210", purpose: "Delivery", dateTime: "2026-02-15 10:30 AM" },
  { name: "Priya Mehta", phone: "9123456789", purpose: "Guest Visit", dateTime: "2026-02-14 11:45 AM" },
  { name: "Courier Boy", phone: "9988776655", purpose: "Courier", dateTime: "2026-02-13 03:15 PM" },
];

const defaultHomeServices = [
  { category: "Electrician", people: [{ name: "Ramesh Kumar", phone: "9876500001" }, { name: "Sunil Yadav", phone: "9876500002" }] },
  { category: "Plumber", people: [{ name: "Manoj Jha", phone: "9876500003" }, { name: "Deepak Tiwari", phone: "9876500004" }] },
  { category: "Maid", people: [{ name: "Sunita Devi", phone: "9876500005" }, { name: "Kamla Bai", phone: "9876500006" }] },
  { category: "Driver", people: [{ name: "Rajesh Chauhan", phone: "9876500007" }, { name: "Anil Sharma", phone: "9876500008" }] },
];

const defaultServiceProviders = [
  { name: "Rajesh Sharma", phone: "9876543210", service: "Electrician", status: "Available" },
  { name: "Suresh Patil", phone: "9123456780", service: "Plumber", status: "Busy" },
  { name: "Meena Joshi", phone: "9988776655", service: "Maid", status: "Available" },
  { name: "Arun Singh", phone: "9765432109", service: "Driver", status: "Available" },
  { name: "Ravi Desai", phone: "9001122334", service: "Pest Control", status: "Busy" },
  { name: "Lata Kumari", phone: "9334455667", service: "Cook", status: "Available" },
];

const defaultProviderSchedule = [
  { flat: "B-203", service: "Plumbing Repair", time: "10:30 AM", date: "Today" },
  { flat: "A-102", service: "Electrical Wiring", time: "2:00 PM", date: "Today" },
  { flat: "C-401", service: "Fan Installation", time: "11:00 AM", date: "Tomorrow" },
  { flat: "D-105", service: "Pipe Leakage Fix", time: "4:30 PM", date: "Tomorrow" },
  { flat: "A-302", service: "Socket Repair", time: "9:00 AM", date: "18 Mar 2026" },
];

const defaultServiceRequests = [
  { resident: "Anita Desai", flat: "A-101", service: "Wiring Repair", date: "2026-03-15", status: "Pending" },
  { resident: "Mohan Gupta", flat: "B-203", service: "Fan Installation", date: "2026-03-14", status: "Accepted" },
  { resident: "Priya Mehta", flat: "C-302", service: "Socket Replacement", date: "2026-03-13", status: "Completed" },
  { resident: "Vikram Singh", flat: "D-102", service: "Light Fitting", date: "2026-03-12", status: "Pending" },
  { resident: "Sunita Rao", flat: "A-405", service: "MCB Repair", date: "2026-03-11", status: "Completed" },
];

const defaultEvents = [
  { title: "Annual General Meeting", date: "March 5, 2026", time: "6:00 PM", location: "Community Hall" },
  { title: "Holi Celebration", date: "March 14, 2026", time: "10:00 AM", location: "Society Garden" },
  { title: "Summer Camp for Kids", date: "April 1, 2026", time: "9:00 AM", location: "Clubhouse" },
  { title: "Maintenance Drive", date: "April 10, 2026", time: "8:00 AM", location: "All Blocks" },
];

// NOTE: We keep in-memory arrays for fallback and quick inspection, but actual API uses SQLite (Prisma).
async function seedDefaults() {
  const visitorCount = await prisma.visitor.count();
  if (visitorCount === 0) {
    await prisma.visitor.createMany({ data: defaultVisitors });
  }

  const myVisitorCount = await prisma.myVisitor.count();
  if (myVisitorCount === 0) {
    await prisma.myVisitor.createMany({ data: defaultMyVisitors });
  }

  const providerCount = await prisma.serviceProvider.count();
  if (providerCount === 0) {
    await prisma.serviceProvider.createMany({ data: defaultServiceProviders });
  }

  const requestCount = await prisma.serviceRequest.count();
  if (requestCount === 0) {
    await prisma.serviceRequest.createMany({ data: defaultServiceRequests });
  }

  const eventCount = await prisma.societyEvent.count();
  if (eventCount === 0) {
    await prisma.societyEvent.createMany({ data: defaultEvents });
  }
}

let visitors = [...defaultVisitors];
let myVisitors = [...defaultMyVisitors];
let serviceProviders = [...defaultServiceProviders];

app.get("/api/ping", (req, res) => res.json({ status: "ok" }));

app.get("/api/visitors", async (req, res) => {
  try {
    const dbVisitors = await prisma.visitor.findMany({ orderBy: { createdAt: "desc" } });
    res.json(dbVisitors);
  } catch (error) {
    res.json(visitors);
  }
});

app.post("/api/visitors", async (req, res) => {
  const { name, phone, purpose, flat } = req.body;
  if (!name || !phone || !purpose || !flat) {
    return res.status(400).json({ error: "name, phone, purpose, and flat are required" });
  }
  const now = new Date();
  const dateTime = now.toLocaleString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true });
  const visitor = { name, phone, purpose, flat, dateTime };

  try {
    const created = await prisma.visitor.create({ data: visitor });
    res.status(201).json(created);
  } catch (error) {
    visitors = [visitor, ...visitors];
    res.status(201).json(visitor);
  }
});

app.get("/api/my-visitors", async (req, res) => {
  try {
    const dbMyVisitors = await prisma.myVisitor.findMany({ orderBy: { createdAt: "desc" } });
    res.json(dbMyVisitors);
  } catch (error) {
    res.json(myVisitors);
  }
});

app.get("/api/home-services", (req, res) => res.json(defaultHomeServices));

app.get("/api/service-providers", async (req, res) => {
  try {
    const dbProviders = await prisma.serviceProvider.findMany({ orderBy: { createdAt: "desc" } });
    res.json(dbProviders);
  } catch (error) {
    res.json(serviceProviders);
  }
});

app.post("/api/service-providers", async (req, res) => {
  const { name, phone, service } = req.body;
  if (!name || !phone || !service) {
    return res.status(400).json({ error: "name, phone, and service are required" });
  }
  const provider = { name, phone, service, status: "Available" };
  try {
    const created = await prisma.serviceProvider.create({ data: provider });
    res.status(201).json(created);
  } catch (error) {
    serviceProviders = [provider, ...serviceProviders];
    res.status(201).json(provider);
  }
});

app.get("/api/provider-schedule", (req, res) => res.json(defaultProviderSchedule));

app.get("/api/service-requests", async (req, res) => {
  try {
    const dbRequests = await prisma.serviceRequest.findMany({ orderBy: { createdAt: "desc" } });
    res.json(dbRequests);
  } catch (error) {
    res.json(defaultServiceRequests);
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const dbEvents = await prisma.societyEvent.findMany({ orderBy: { createdAt: "desc" } });
    res.json(dbEvents);
  } catch (error) {
    res.json(defaultEvents);
  }
});

app.post("/api/login", (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: "username, password, and role are required" });
  }

  // For demo, accept any credentials but return same role
  res.json({ success: true, role });
});

seedDefaults().catch((err) => {
  console.error("Seeding defaults failed", err);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Society Portal backend listening on http://localhost:${port}`);
});
