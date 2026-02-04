"use client";

import type { Service, Barber, Appointment, Review, DashboardStats, SiteSettings } from "./types";

const STORAGE_KEYS = {
  SERVICES: "barbershop_services",
  BARBERS: "barbershop_barbers",
  APPOINTMENTS: "barbershop_appointments",
  REVIEWS: "barbershop_reviews",
  DASHBOARD_STATS: "barbershop_dashboard_stats",
  SITE_SETTINGS: "barbershop_site_settings",
  ADMIN_AUTH: "barbershop_admin_auth",
};

// Generate time slots from 07:00 to 00:00 in 5-minute intervals
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 7; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    }
  }
  slots.push("00:00");
  return slots;
};

const defaultTimeSlots = generateTimeSlots();

const defaultServices: Service[] = [
  {
    id: "1",
    name: "Corte Tradicional",
    description: "Corte classico com tesoura e maquina, finalizacao com styling",
    duration: 30,
    price: 45,
    availableTimes: defaultTimeSlots,
  },
  {
    id: "2",
    name: "Barba Completa",
    description: "Aparar, desenhar e hidratacao com toalha quente",
    duration: 25,
    price: 35,
    availableTimes: defaultTimeSlots,
  },
  {
    id: "3",
    name: "Corte + Barba",
    description: "Combo completo: corte tradicional e barba",
    duration: 50,
    price: 70,
    availableTimes: defaultTimeSlots,
  },
  {
    id: "4",
    name: "Corte Degrade",
    description: "Corte moderno com degrade personalizado",
    duration: 40,
    price: 55,
    availableTimes: defaultTimeSlots,
  },
  {
    id: "5",
    name: "Hidratacao Capilar",
    description: "Tratamento profundo para cabelos ressecados",
    duration: 30,
    price: 40,
    availableTimes: defaultTimeSlots,
  },
  {
    id: "6",
    name: "Pigmentacao de Barba",
    description: "Coloracao natural para barba com falhas",
    duration: 45,
    price: 60,
    availableTimes: defaultTimeSlots,
  },
];

const defaultBarbers: Barber[] = [
  {
    id: "1",
    name: "Carlos Silva",
    specialty: "Cortes Classicos",
    avatar: "",
    available: true,
    serviceIds: ["1", "2", "3", "4"],
    rating: 4.9,
    totalRatings: 150,
  },
  {
    id: "2",
    name: "Rafael Santos",
    specialty: "Degrade & Fade",
    avatar: "",
    available: true,
    serviceIds: ["1", "3", "4", "5"],
    rating: 4.8,
    totalRatings: 120,
  },
  {
    id: "3",
    name: "Marcos Oliveira",
    specialty: "Barba & Tratamentos",
    avatar: "",
    available: true,
    serviceIds: ["2", "3", "5", "6"],
    rating: 4.7,
    totalRatings: 95,
  },
];

const defaultSiteSettings: SiteSettings = {
  logoName: "BarberPro",
  logoIcon: "scissors",
  primaryColor: "#d4a855",
  secondaryColor: "#c75a3a",
  backgroundColor: "#1a1a1f",
  heroTitle: "Estilo e Precisao em Cada Corte",
  heroDescription: "Experimente o melhor em cuidados masculinos. Nossa equipe de barbeiros especializados esta pronta para transformar seu visual com cortes impecaveis e tratamentos exclusivos.",
  yearsExperience: 8,
  headerTagline: "Barbearia Premium desde 2015",
  aboutTitle: "Sobre a BarberPro",
  aboutDescription: "Fundada em 2015, a BarberPro nasceu da paixao por transformar a experiencia de cuidados masculinos em algo verdadeiramente especial. Acreditamos que cada cliente merece um tratamento personalizado e de excelencia.",
  aboutMission: "Proporcionar experiencias unicas de cuidados masculinos, combinando tecnicas tradicionais com tendencias modernas, em um ambiente acolhedor e sofisticado.",
  aboutVision: "Ser referencia em barbearia premium, reconhecida pela qualidade excepcional dos servicos e pelo compromisso com a satisfacao de cada cliente.",
  heroBackgroundImage: "",
  heroBackgroundBlur: 0,
};

// Services
export function getServices(): Service[] {
  if (typeof window === "undefined") return defaultServices;
  const stored = localStorage.getItem(STORAGE_KEYS.SERVICES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(defaultServices));
    return defaultServices;
  }
  return JSON.parse(stored);
}

export function saveServices(services: Service[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
}

// Barbers
export function getBarbers(): Barber[] {
  if (typeof window === "undefined") return defaultBarbers;
  const stored = localStorage.getItem(STORAGE_KEYS.BARBERS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.BARBERS, JSON.stringify(defaultBarbers));
    return defaultBarbers;
  }
  return JSON.parse(stored);
}

export function saveBarbers(barbers: Barber[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.BARBERS, JSON.stringify(barbers));
}

export function updateBarberRating(barberId: string, newRating: number): void {
  const barbers = getBarbers();
  const barber = barbers.find(b => b.id === barberId);
  if (barber) {
    const totalScore = barber.rating * barber.totalRatings + newRating;
    barber.totalRatings += 1;
    barber.rating = Math.round((totalScore / barber.totalRatings) * 10) / 10;
    saveBarbers(barbers);
  }
}

// Appointments
export function getAppointments(): Appointment[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  if (!stored) return [];
  return JSON.parse(stored);
}

export function saveAppointments(appointments: Appointment[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
}

export function addAppointment(appointment: Omit<Appointment, "id" | "createdAt">): Appointment {
  const appointments = getAppointments();
  const newAppointment: Appointment = {
    ...appointment,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  appointments.push(newAppointment);
  saveAppointments(appointments);
  return newAppointment;
}

export function updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
  const appointments = getAppointments();
  const index = appointments.findIndex((a) => a.id === id);
  if (index === -1) return null;
  appointments[index] = { ...appointments[index], ...updates };
  saveAppointments(appointments);
  return appointments[index];
}

export function deleteAppointment(id: string): boolean {
  const appointments = getAppointments();
  const filtered = appointments.filter((a) => a.id !== id);
  if (filtered.length === appointments.length) return false;
  saveAppointments(filtered);
  return true;
}

export function isTimeSlotAvailable(date: string, time: string, barberId: string): boolean {
  const appointments = getAppointments();
  return !appointments.some(
    a => a.date === date && 
    a.time === time && 
    a.barberId === barberId && 
    a.status !== "rejected"
  );
}

// Reviews
export function getReviews(): Review[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  if (!stored) return [];
  return JSON.parse(stored);
}

export function saveReviews(reviews: Review[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
}

export function addReview(review: Omit<Review, "id" | "createdAt">): Review {
  const reviews = getReviews();
  const newReview: Review = {
    ...review,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  reviews.push(newReview);
  saveReviews(reviews);
  updateBarberRating(review.barberId, review.barberRating);
  return newReview;
}

export function getAverageEstablishmentRating(): number {
  const reviews = getReviews();
  if (reviews.length === 0) return 4.9;
  const total = reviews.reduce((sum, r) => sum + r.establishmentRating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

// Dashboard Stats
export function getDashboardStats(): DashboardStats[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.DASHBOARD_STATS);
  if (!stored) return [];
  return JSON.parse(stored);
}

export function saveDashboardStats(stats: DashboardStats[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.DASHBOARD_STATS, JSON.stringify(stats));
}

export function updateDashboardStats(revenue: number): void {
  const stats = getDashboardStats();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  let currentStat = stats.find(s => s.year === year && s.month === month);
  if (!currentStat) {
    currentStat = { year, month, totalCuts: 0, totalRevenue: 0 };
    stats.push(currentStat);
  }
  currentStat.totalCuts += 1;
  currentStat.totalRevenue += revenue;
  saveDashboardStats(stats);
}

export function getTotalCompletedCuts(): number {
  const appointments = getAppointments();
  return appointments.filter(a => a.status === "completed").length;
}

export function getSatisfiedClientsCount(): number {
  const totalCuts = getTotalCompletedCuts();
  return 2000 + Math.floor(totalCuts / 100) * 100;
}

// Site Settings
export function getSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return defaultSiteSettings;
  const stored = localStorage.getItem(STORAGE_KEYS.SITE_SETTINGS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(defaultSiteSettings));
    return defaultSiteSettings;
  }
  return JSON.parse(stored);
}

export function saveSiteSettings(settings: SiteSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(settings));
}

// Admin Auth
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export function checkAdminAuth(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === "authenticated";
}

export function adminLogin(username: string, password: string): boolean {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, "authenticated");
    return true;
  }
  return false;
}

export function adminLogout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
}

export function getAllTimeSlots(): string[] {
  return defaultTimeSlots;
}

export function getAvailableTimeSlots(date: string, barberId: string, serviceId?: string): string[] {
  const appointments = getAppointments();
  const bookedTimes = appointments
    .filter((a) => a.date === date && a.barberId === barberId && a.status !== "rejected")
    .map((a) => a.time);

  let allSlots = defaultTimeSlots;
  
  if (serviceId) {
    const services = getServices();
    const service = services.find(s => s.id === serviceId);
    if (service && service.availableTimes?.length > 0) {
      allSlots = service.availableTimes;
    }
  }

  return allSlots.filter((slot) => !bookedTimes.includes(slot));
}
