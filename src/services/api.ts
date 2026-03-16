/**
 * API Service - Centralized backend API calls
 * All endpoints connect to Flask backend running on localhost:5000
 */

const API_BASE_URL = "http://localhost:5000";

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
      mode: "cors",
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Response wasn't JSON, use status text
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('CORS')) {
      throw new Error(`CORS Error: Make sure backend is running on ${API_BASE_URL}`);
    }
    throw error;
  }
}

// ============ AUTH ENDPOINTS ============

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    name: string;
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

export async function getUsers(): Promise<any> {
  return apiCall("/users");
}

export async function getUsersByRole(role: string): Promise<any> {
  return apiCall(`/users/role/${role}`);
}

// ============ VISITOR ENDPOINTS ============

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

export async function addVisitor(visitor: Omit<Visitor, "id">): Promise<any> {
  return apiCall("/visitors/add", {
    method: "POST",
    body: JSON.stringify({
      name: visitor.name,
      phone: visitor.phone,
      purpose: visitor.purpose,
      flat_number: visitor.flat_number,
    }),
  });
}

export async function getAllVisitors(): Promise<any> {
  return apiCall("/visitors");
}

export async function getVisitorById(id: number): Promise<any> {
  return apiCall(`/visitors/${id}`);
}

export async function getVisitorsByFlat(flatNumber: string): Promise<any> {
  return apiCall(`/visitors/flat/${flatNumber}`);
}

export async function checkoutVisitor(id: number): Promise<any> {
  return apiCall(`/visitors/${id}/checkout`, {
    method: "PUT",
  });
}

export async function getActiveVisitors(): Promise<any> {
  return apiCall("/visitors/active");
}

// ============ SERVICE PROVIDER ENDPOINTS ============

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

export async function getAllProviders(): Promise<any> {
  return apiCall("/providers");
}

export async function getProviderById(id: number): Promise<any> {
  return apiCall(`/providers/${id}`);
}

export async function getProvidersByService(serviceType: string): Promise<any> {
  return apiCall(`/providers/type/${serviceType}`);
}

export async function addProvider(provider: Omit<ServiceProvider, "id">): Promise<any> {
  return apiCall("/providers/add", {
    method: "POST",
    body: JSON.stringify(provider),
  });
}

// ============ SERVICE REQUEST ENDPOINTS ============

export interface ServiceRequest {
  id?: number;
  provider_id: number;
  resident_id: number;
  description: string;
  status?: string;
  created_at?: string;
}

export async function createServiceRequest(request: Omit<ServiceRequest, "id">): Promise<any> {
  return apiCall("/service/request", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getServiceRequests(
  providerId?: number,
  residentId?: number
): Promise<any> {
  let url = "/service/requests";
  const params = new URLSearchParams();

  if (providerId) params.append("provider_id", providerId.toString());
  if (residentId) params.append("resident_id", residentId.toString());

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  return apiCall(url);
}

// ============ SCHEDULE ENDPOINTS ============

export interface Schedule {
  id?: number;
  provider_id: number;
  schedule_date: string;
  start_time: string;
  end_time: string;
  created_at?: string;
}

export async function getProviderSchedule(providerId: number): Promise<any> {
  return apiCall(`/provider/schedule/${providerId}`);
}

export async function addProviderSchedule(schedule: Omit<Schedule, "id">): Promise<any> {
  return apiCall("/provider/schedule/add", {
    method: "POST",
    body: JSON.stringify(schedule),
  });
}

export default {
  login,
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
  getServiceRequests,
  getProviderSchedule,
  addProviderSchedule,
};
