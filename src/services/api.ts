/**
 * API Service - Centralized backend API calls
 * Connects to backend running on localhost:5000
 */

const API_BASE_URL = "http://localhost:5000";

// Generic API helper
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const tryUrls = [`${API_BASE_URL}${endpoint}`, `${API_BASE_URL}/api${endpoint}`];
  let lastError: unknown = null;

  for (const url of tryUrls) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
        mode: "cors",
      });

      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const data = await response.json();
          message = (data as any).message || message;
        } catch {}
        throw new Error(message);
      }

      return response.json();
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("Unknown API error");
}

// ================= AUTH =================

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    name: string;
    provider_id?: number;   // service_providers.id (PROVIDER only)
    service_type?: string;  // service type (PROVIDER only)
  };
}

export async function login(
  username: string,
  password: string,
  role: string
): Promise<LoginResponse> {
  return apiCall<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ username, password, role }),
  });
}

export async function getUsers() {
  return apiCall("/users");
}

export async function getUsersByRole(role: string) {
  return apiCall(`/users/role/${role}`);
}

// ================= VISITORS =================

export interface Visitor {
  id?: number;
  name: string;
  phone: string;
  purpose: string;
  flat_number: string;
  check_in_time?: string;
  check_out_time?: string | null;
  created_at?: string;
}

export async function addVisitor(visitor: Omit<Visitor, "id">) {
  // Flask API endpoint uses /visitors/add (POST), Express API may use /visitors
  try {
    return await apiCall("/visitors/add", {
      method: "POST",
      body: JSON.stringify(visitor),
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "";
    if (errMsg.includes("404") || errMsg.includes("405")) {
      return apiCall("/visitors", {
        method: "POST",
        body: JSON.stringify(visitor),
      });
    }
    throw error;
  }
}

export async function getAllVisitors() {
  return apiCall("/visitors");
}

export async function getVisitorById(id: number) {
  return apiCall(`/visitors/${id}`);
}

export async function getVisitorsByFlat(flatNumber: string) {
  return apiCall(`/visitors/flat/${flatNumber}`);
}

export async function checkoutVisitor(id: number) {
  return apiCall(`/visitors/${id}/checkout`, {
    method: "PUT",
  });
}

export async function getActiveVisitors() {
  return apiCall("/visitors/active");
}

// ================= SERVICE PROVIDERS =================

export interface ServiceProvider {
  id?: number;
  name: string;
  service_type: string;
  phone: string;
  email: string;
  description?: string;
  rating?: number;
  created_at?: string;
}

export async function getProviderById(id: number) {
  return apiCall(`/providers/${id}`);
}

export async function getProvidersByService(serviceType: string) {
  return apiCall(`/providers/type/${serviceType}`);
}

export async function addProvider(provider: Omit<ServiceProvider, "id">) {
  // Flask path is POST /providers/add, Express path is likely POST /api/service-providers
  const endpoints = ["/providers/add", "/providers", "/service-providers"];

  for (const endpoint of endpoints) {
    try {
      const res = await apiCall(endpoint, {
        method: "POST",
        body: JSON.stringify(provider),
      });
      return res;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "";
      if (!errMsg.includes("404") && !errMsg.includes("405")) {
        throw error;
      }
      // try next endpoint
    }
  }

  throw new Error("Failed to add provider: no supported endpoint available");
}

export async function getAllProviders() {
  try {
    return await apiCall("/providers");
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "";
    if (errMsg.includes("404") || errMsg.includes("405")) {
      return apiCall("/service-providers");
    }
    throw error;
  }
}

// ================= SERVICE REQUESTS =================

export interface ServiceRequest {
  id?: number;
  provider_id?: number | null;
  resident_id: number;
  service_type: string;
  description: string;
  status?: string;
  created_at?: string;
}

export async function createServiceRequest(
  request: { resident_id: number; service_type: string; description: string }
) {
  return apiCall("/create_request", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function acceptServiceRequest(
  requestId: number,
  providerId: number
) {
  return apiCall("/accept_request", {
    method: "POST",
    body: JSON.stringify({ request_id: requestId, provider_id: providerId }),
  });
}

export async function getServiceRequests(
  providerId?: number,
  residentId?: number
) {
  let url = "/service/requests";
  const params = new URLSearchParams();

  if (providerId) params.append("provider_id", providerId.toString());
  if (residentId) params.append("resident_id", residentId.toString());

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  return apiCall(url);
}

// ================= SCHEDULE =================

export interface Schedule {
  id?: number;
  provider_id: number;
  schedule_date: string;
  start_time: string;
  end_time: string;
  created_at?: string;
}

export async function getProviderSchedule(providerId: number) {
  return apiCall(`/provider/schedule/${providerId}`);
}

export async function addProviderSchedule(schedule: Omit<Schedule, "id">) {
  return apiCall("/provider/schedule", {
    method: "POST",
    body: JSON.stringify(schedule),
  });
}

// ================= AUTH: REGISTER =================

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "RESIDENT" | "PROVIDER";
  username?: string;
}

export async function register(data: RegisterRequest) {
  return apiCall("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ================= HELPER: Get logged-in user =================

export function getLoggedInUser() {
  try {
    const stored = localStorage.getItem("appUser");
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export default {
  login,
  register,
  getUsers,
  getUsersByRole,
  addVisitor,
  getAllVisitors,
  getVisitorById,
  getVisitorsByFlat,
  checkoutVisitor,
  getActiveVisitors,
  getAllProviders,
  getProviderById,
  getProvidersByService,
  addProvider,
  createServiceRequest,
  acceptServiceRequest,
  getServiceRequests,
  getProviderSchedule,
  addProviderSchedule,
  getLoggedInUser,
};