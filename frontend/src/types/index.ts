// ─── User & Auth ───────────────────────────────────────────────────────────────

export type UserRole = "STUDENT" | "COACH" | "ADMIN";

export interface User {
  id: string;
  lineId: string;
  displayName: string;
  pictureUrl?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ─── Coach ────────────────────────────────────────────────────────────────────

export type CoachStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface Coach {
  id: string;
  userId: string;
  user: User;
  bio: string;
  specialties: string[];
  experience: number; // years
  rating: number;
  reviewCount: number;
  status: CoachStatus;
  timezone: string;
  location?: string;
  languages: string[];
  certifications: string[];
  coverImageUrl?: string;
  services: Service[];
  createdAt: string;
  updatedAt: string;
}

export interface CoachFilters {
  search?: string;
  specialty?: string;
  minRating?: number;
  maxPrice?: number;
  language?: string;
  page?: number;
  limit?: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export type ServiceType = "ONE_ON_ONE" | "GROUP" | "WORKSHOP";

export interface Service {
  id: string;
  coachId: string;
  name: string;
  description: string;
  type: ServiceType;
  durationMinutes: number;
  price: number; // in TWD
  currency: string;
  maxParticipants: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Availability & Slots ─────────────────────────────────────────────────────

export type SlotStatus = "AVAILABLE" | "BOOKED" | "BLOCKED";

export interface AvailabilitySlot {
  id: string;
  coachId: string;
  startTime: string; // ISO 8601
  endTime: string;
  status: SlotStatus;
  serviceId?: string;
  recurrenceRule?: string;
}

export interface AvailabilityPattern {
  coachId: string;
  dayOfWeek: number; // 0=Sun, 6=Sat
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  timezone: string;
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export interface Booking {
  id: string;
  studentId: string;
  student: User;
  coachId: string;
  coach: Coach;
  serviceId: string;
  service: Service;
  slotId: string;
  slot: AvailabilitySlot;
  status: BookingStatus;
  notes?: string;
  meetingUrl?: string;
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  coachId: string;
  serviceId: string;
  slotId: string;
  notes?: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";
export type PaymentMethod = "ECPAY" | "LINE_PAY" | "CREDIT_CARD";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  tradeNo?: string;
  ecpayTradeNo?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInitPayload {
  bookingId: string;
  method: PaymentMethod;
  returnUrl: string;
}

export interface PaymentInitResponse {
  paymentUrl: string;
  tradeNo: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "BOOKING_REMINDER"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "NEW_REVIEW";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  bookingId: string;
  studentId: string;
  student: User;
  coachId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface PlatformStats {
  totalUsers: number;
  totalCoaches: number;
  totalBookings: number;
  totalRevenue: number;
  pendingCoachApprovals: number;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  activeUsers: number;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: Record<string, string[]>;
}
