import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type {
  AuthTokens,
  Booking,
  ConveraEvent,
  EventsResponse,
  PaymentInitResponse,
  Property,
  Review,
  AdminUser,
  AdminUserDetail,
  AdminProperty,
  AdminMetrics,
  ActivityLog,
  PaginatedResponse,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("convera_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}

let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: 401 → refresh or logout
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (original.headers) original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("convera_refresh_token");
        if (!refreshToken) throw new Error("No refresh token");
        const { data } = await axios.post<{ data: AuthTokens }>(`${BASE_URL}/auth/refresh`, { refreshToken });
        const tokens = data.data;

        localStorage.setItem("convera_access_token", tokens.accessToken);
        localStorage.setItem("convera_refresh_token", tokens.refreshToken);
        localStorage.setItem("convera_user", JSON.stringify(tokens.user));
        document.cookie = `convera_token=${tokens.accessToken}; path=/; SameSite=Lax; max-age=86400`;
        document.cookie = `convera_role=${tokens.user.role}; path=/; SameSite=Lax; max-age=86400`;

        if (original.headers) original.headers.Authorization = `Bearer ${tokens.accessToken}`;

        processQueue(null, tokens.accessToken);
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("convera_access_token");
        localStorage.removeItem("convera_refresh_token");
        localStorage.removeItem("convera_user");
        document.cookie = "convera_token=; path=/; max-age=0";
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// --- AUTH ---
export const authApi = {
  register: (email: string, password: string, role?: "CUSTOMER" | "HOST") =>
    api.post("/auth/register", { email, password, role }),

  verify: (email: string, code: string) =>
    api.post("/auth/verify", { email, code }),

  login: (email: string, password: string) =>
    api.post<{ data: AuthTokens; message: string }>("/auth/login", { email, password }),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (email: string, code: string, password: string) =>
    api.post("/auth/reset-password", { email, code, password }),
};

// --- PROPERTIES ---
export interface PropertyFilters {
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  priceMin?: number;
  priceMax?: number;
  checkIn?: string;
  checkOut?: string;
  ratingMin?: number;
}

export const propertiesApi = {
  list: (filters?: PropertyFilters) =>
    api.get<Property[]>("/properties", { params: filters }),

  get: (id: string) =>
    api.get<Property>(`/properties/${id}`),

  createReview: (propertyId: string, data: { bookingId: string; rating: number; comment?: string }) =>
    api.post<Review>(`/properties/${propertyId}/reviews`, data),
};

// --- HOST ---
export interface CreatePropertyData {
  title: string;
  description: string;
  type: "APARTMENT" | "HOTEL";
  latitude: number;
  longitude: number;
  address: string;
  amenities: string[];
  imageUrls: string[];
  basePrice: number;
  isActive?: boolean;
}

export const hostApi = {
  listProperties: () =>
    api.get<Property[]>("/host/properties"),

  createProperty: (data: CreatePropertyData) =>
    api.post<Property>("/host/properties", data),

  updateProperty: (id: string, data: Partial<CreatePropertyData>) =>
    api.patch<Property>(`/host/properties/${id}`, data),

  deleteProperty: (id: string) =>
    api.delete(`/host/properties/${id}`),

  updateAvailability: (
    id: string,
    data: { startDate: string; endDate: string; status: string; overridePrice?: number }
  ) => api.post(`/host/properties/${id}/availability`, data),

  toggleActive: (id: string) =>
    api.post<{ id: string; isActive: boolean }>(`/host/properties/${id}/toggle-active`),
};

// --- EVENTS ---
export interface EventFilters {
  cursor?: string;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  date?: string;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
}

export const eventsApi = {
  list: (filters?: EventFilters) =>
    api.get<EventsResponse>("/events", { params: filters }),

  getCategories: () =>
    api.get<{ id: string; name: string; description: string }[]>("/events/categories"),

  get: (id: string) =>
    api.get<ConveraEvent>(`/events/${id}`),

  register: (id: string) =>
    api.post<{ success: boolean }>(`/events/${id}/register`, {}),
};

// --- ADMIN EVENTS ---
export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  locationLat: number;
  locationLng: number;
  address: string;
  price: number;
  categoryId: string;
  maxCapacity: number;
  coverImage: string;
  eligibility?: {
    minAge?: number;
    ticketTypes: string[];
    specialRequirements?: string;
  };
  galleryImages?: { imageUrl: string; displayOrder: number }[];
}

export const adminEventsApi = {
  create: (data: CreateEventData) =>
    api.post<ConveraEvent>("/admin/events", data),

  update: (id: string, data: Partial<CreateEventData>) =>
    api.put<ConveraEvent>(`/admin/events/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/events/${id}`),

  importEvents: () =>
    api.post<{ success: boolean; imported: number; updated: number }>("/admin/events/import"),

  createCategory: (data: { name: string; description: string }) =>
    api.post("/admin/events/categories", data),

  deleteCategory: (id: string) =>
    api.delete(`/admin/events/categories/${id}`),
};

// --- BOOKINGS ---
export const bookingsApi = {
  create: (propertyId: string, startDate: string, endDate: string) =>
    api.post<Booking>("/bookings", { propertyId, startDate, endDate }),

  listMe: () =>
    api.get<Booking[]>("/bookings/me"),

  get: (id: string) =>
    api.get<Booking>(`/bookings/${id}`),
};

// --- PAYMENTS ---
export const paymentsApi = {
  initialize: (bookingId: string, provider: "STRIPE" | "PAYMOB") =>
    api.post<PaymentInitResponse>("/payments/initialize", { bookingId, provider }),

  confirmMock: (bookingId: string) =>
    api.post<{ status: string; bookingId: string }>("/payments/confirm-mock", { bookingId }),
};

// --- CHAT ---
export const chatApi = {
  createSession: (propertyId: string) =>
    api.post<{ sessionId: string }>("/chat/sessions", { propertyId }),

  listSessions: () =>
    api.get<{
      sessionId: string;
      propertyTitle: string;
      propertyAddress: string;
      lastMessage?: string;
      lastMessageAt?: string;
      lastMessageSenderId?: string;
      isHost?: boolean;
      hasUnread: boolean;
    }[]>("/chat/sessions"),

  getHistory: (sessionId: string, limit?: number, offset?: number) =>
    api.get<{ data: { id: string; sessionId: string; senderId: string; content: string; createdAt: string }[] }>(
      `/chat/${sessionId}/history`,
      { params: { limit, offset } },
    ),
};

// --- ADMIN ---
export const adminApi = {
  listUsers: (params?: { cursor?: string; take?: number; role?: string; status?: string; search?: string }) =>
    api.get<PaginatedResponse<AdminUser>>("/admin/users", { params }),

  getUserDetail: (id: string) =>
    api.get<AdminUserDetail>(`/admin/users/${id}`),

  changeUserStatus: (id: string, data: { status: string; reason: string }) =>
    api.patch<AdminUser>(`/admin/users/${id}/status`, data),

  listProperties: (params?: { cursor?: string; take?: number; status?: string; search?: string }) =>
    api.get<PaginatedResponse<AdminProperty>>("/admin/properties", { params }),

  changePropertyStatus: (id: string, data: { status: string; reason: string }) =>
    api.patch<AdminProperty>(`/admin/properties/${id}/status`, data),

  getMetrics: () =>
    api.get<AdminMetrics>("/admin/metrics"),

  getActivityLogs: (params?: { cursor?: string; take?: number; actionType?: string; startDate?: string; endDate?: string }) =>
    api.get<PaginatedResponse<ActivityLog>>("/admin/activity-logs", { params }),
};
