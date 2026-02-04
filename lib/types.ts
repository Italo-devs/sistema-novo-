export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  availableTimes: string[];
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  available: boolean;
  serviceIds: string[];
  rating: number;
  totalRatings: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "rejected";
  createdAt: string;
  completedAt?: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  clientName: string;
  barberId: string;
  establishmentRating: number;
  barberRating: number;
  comment?: string;
  createdAt: string;
}

export interface DashboardStats {
  year: number;
  month: number;
  totalCuts: number;
  totalRevenue: number;
}

export interface SiteSettings {
  logoName: string;
  logoIcon: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  heroTitle: string;
  heroDescription: string;
  yearsExperience: number;
  headerTagline: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutMission: string;
  aboutVision: string;
  heroBackgroundImage?: string;
  heroBackgroundBlur?: number;
}

export interface AdminUser {
  username: string;
  passwordHash: string;
}
