export type Role = "CUSTOMER" | "HOST" | "ADMIN" | "SYSTEM_ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  createdAt: string;
}

export interface AvailabilityOverride {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  status: "BLOCKED" | "PRICE_OVERRIDE";
  overridePrice?: number;
}

export interface Property {
  id: string;
  hostId: string;
  title: string;
  description: string;
  type: "APARTMENT" | "HOTEL";
  latitude: number;
  longitude: number;
  address: string;
  amenities: string[];
  imageUrls: string[];
  basePrice: number;
  isActive: boolean;
  avgRating?: number;
  reviews?: Review[];
  bookings?: { startDate: string; endDate: string }[];
  availabilityOverrides?: AvailabilityOverride[];
  createdAt?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  description?: string;
}

export interface EventGalleryImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
}

export interface EventEligibility {
  minAge?: number;
  ticketTypes: string[];
  specialRequirements?: string;
}

export interface EventSource {
  sourceType: string;
  externalProviderName?: string;
  externalEventId?: string;
}

export interface ConveraEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  address: string;
  price: number;
  coverImage: string;
  category: EventCategory;
  remainingSpots: number;
  maxCapacity: number;
  isSoldOut: boolean;
  status: "ACTIVE" | "CANCELLED";
  locationLat: number;
  locationLng: number;
  galleryImages?: EventGalleryImage[];
  eligibility?: EventEligibility;
  source?: EventSource;
}

export interface EventsResponse {
  events: ConveraEvent[];
  nextCursor?: string;
}

export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: string;
  propertyId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
  property?: Property;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  provider: "STRIPE" | "PAYMOB";
  providerRef: string;
  status: "INITIATED" | "SUCCESS" | "FAILED";
  createdAt: string;
}

export interface PaymentInitResponse {
  transactionId: string;
  providerRef: string;
  paymentUrl: string;
}

// --- Admin Types ---

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUser {
  bookingCount: number;
  propertyCount: number;
  lastLoginAt: string | null;
}

export interface AdminProperty {
  id: string;
  title: string;
  hostId: string;
  hostEmail: string;
  address: string;
  type: string;
  isActive: boolean;
  listingStatus: string;
  bookingCount: number;
  createdAt: string;
}

export interface AdminMetrics {
  users: { total: number; byRole: Record<string, number> };
  properties: { total: number; active: number };
  events: { total: number; active: number };
  bookings: { total: number; byStatus: Record<string, number> };
  revenue: { total: number; currency: string };
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actionType: string;
  targetEntityType: string;
  targetEntityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
