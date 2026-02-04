"use client";

import React from "react"

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Scissors,
  Calendar,
  Users,
  LogOut,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  Star,
  TrendingUp,
  Check,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";
import {
  checkAdminAuth,
  adminLogout,
  getAppointments,
  getServices,
  getBarbers,
  saveServices,
  saveBarbers,
  updateAppointment,
  deleteAppointment,
  getReviews,
  getDashboardStats,
  updateDashboardStats,
  getSiteSettings,
  saveSiteSettings,
  getAllTimeSlots,
} from "@/lib/store";
import type { Appointment, Service, Barber, Review, DashboardStats, SiteSettings } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ReviewModal } from "@/components/review-modal";
import { formatDuration } from "@/lib/time-utils";

const allTimeSlots = getAllTimeSlots();

const colorPresets = [
  { name: "Dourado", value: "#d4a855" },
  { name: "Laranja", value: "#f97316" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Roxo", value: "#a855f7" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Ciano", value: "#06b6d4" },
  { name: "Verde", value: "#22c55e" },
  { name: "Lima", value: "#84cc16" },
  { name: "Amarelo", value: "#eab308" },
  { name: "Branco", value: "#ffffff" },
  { name: "Cinza", value: "#6b7280" },
];

const bgColorPresets = [
  { name: "Preto", value: "#1a1a1f" },
  { name: "Cinza Escuro", value: "#1f2937" },
  { name: "Azul Escuro", value: "#1e293b" },
  { name: "Marrom Escuro", value: "#292524" },
  { name: "Verde Escuro", value: "#14532d" },
  { name: "Roxo Escuro", value: "#2e1065" },
  { name: "Vermelho Escuro", value: "#450a0a" },
  { name: "Cinza", value: "#374151" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Service dialog state
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceAvailableTimes, setServiceAvailableTimes] = useState<string[]>([]);

  // Barber dialog state
  const [barberDialogOpen, setBarberDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [barberName, setBarberName] = useState("");
  const [barberSpecialty, setBarberSpecialty] = useState("");
  const [barberAvailable, setBarberAvailable] = useState(true);
  const [barberServiceIds, setBarberServiceIds] = useState<string[]>([]);
  const [barberAvatar, setBarberAvatar] = useState("");

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [completingAppointment, setCompletingAppointment] = useState<Appointment | null>(null);

  // Dashboard filter state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0);

  // File input refs
  const barberFileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!checkAdminAuth()) {
      router.push("/admin");
      return;
    }
    loadData();
  }, [router]);

  const loadData = () => {
    setAppointments(getAppointments());
    setServices(getServices());
    setBarbers(getBarbers());
    setReviews(getReviews());
    setDashboardStats(getDashboardStats());
    setSiteSettings(getSiteSettings());
  };

  const handleLogout = () => {
    adminLogout();
    router.push("/admin");
  };

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || "N/A";
  };

  const getServicePrice = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.price || 0;
  };

  const getBarberName = (barberId: string) => {
    return barbers.find((b) => b.id === barberId)?.name || "N/A";
  };

  const getBarberById = (barberId: string) => {
    return barbers.find((b) => b.id === barberId) || null;
  };

  const handleStatusChange = (appointmentId: string, status: Appointment["status"]) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (status === "completed" && appointment) {
      updateAppointment(appointmentId, { 
        status, 
        completedAt: new Date().toISOString() 
      });
      
      const price = getServicePrice(appointment.serviceId);
      updateDashboardStats(price);
      
      setCompletingAppointment(appointment);
      setReviewModalOpen(true);
    } else {
      updateAppointment(appointmentId, { status });
    }
    
    loadData();
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      deleteAppointment(appointmentId);
      loadData();
    }
  };

  // Service CRUD
  const openServiceDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceName(service.name);
      setServiceDescription(service.description);
      setServiceDuration(service.duration.toString());
      setServicePrice(service.price.toString());
      setServiceAvailableTimes(service.availableTimes || allTimeSlots.slice(0, 50));
    } else {
      setEditingService(null);
      setServiceName("");
      setServiceDescription("");
      setServiceDuration("");
      setServicePrice("");
      setServiceAvailableTimes(allTimeSlots.slice(0, 50));
    }
    setServiceDialogOpen(true);
  };

  const handleSaveService = () => {
    const updatedServices = [...services];
    const serviceData: Service = {
      id: editingService?.id || crypto.randomUUID(),
      name: serviceName,
      description: serviceDescription,
      duration: parseInt(serviceDuration) || 30,
      price: parseFloat(servicePrice) || 0,
      availableTimes: serviceAvailableTimes,
    };

    if (editingService) {
      const index = updatedServices.findIndex((s) => s.id === editingService.id);
      if (index !== -1) {
        updatedServices[index] = serviceData;
      }
    } else {
      updatedServices.push(serviceData);
    }

    saveServices(updatedServices);
    setServiceDialogOpen(false);
    loadData();
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm("Tem certeza que deseja excluir este servico?")) {
      const updatedServices = services.filter((s) => s.id !== serviceId);
      saveServices(updatedServices);
      loadData();
    }
  };

  // Barber CRUD
  const openBarberDialog = (barber?: Barber) => {
    if (barber) {
      setEditingBarber(barber);
      setBarberName(barber.name);
      setBarberSpecialty(barber.specialty);
      setBarberAvailable(barber.available);
      setBarberServiceIds(barber.serviceIds || []);
      setBarberAvatar(barber.avatar || "");
    } else {
      setEditingBarber(null);
      setBarberName("");
      setBarberSpecialty("");
      setBarberAvailable(true);
      setBarberServiceIds([]);
      setBarberAvatar("");
    }
    setBarberDialogOpen(true);
  };

  const handleBarberImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBarberAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (siteSettings) {
          setSiteSettings({ ...siteSettings, heroBackgroundImage: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBarber = () => {
    const updatedBarbers = [...barbers];
    const barberData: Barber = {
      id: editingBarber?.id || crypto.randomUUID(),
      name: barberName,
      specialty: barberSpecialty,
      avatar: barberAvatar,
      available: barberAvailable,
      serviceIds: barberServiceIds,
      rating: editingBarber?.rating || 5.0,
      totalRatings: editingBarber?.totalRatings || 0,
    };

    if (editingBarber) {
      const index = updatedBarbers.findIndex((b) => b.id === editingBarber.id);
      if (index !== -1) {
        updatedBarbers[index] = barberData;
      }
    } else {
      updatedBarbers.push(barberData);
    }

    saveBarbers(updatedBarbers);
    setBarberDialogOpen(false);
    loadData();
  };

  const handleDeleteBarber = (barberId: string) => {
    if (confirm("Tem certeza que deseja excluir este barbeiro?")) {
      const updatedBarbers = barbers.filter((b) => b.id !== barberId);
      saveBarbers(updatedBarbers);
      loadData();
    }
  };

  // Site Settings
  const handleSaveSiteSettings = () => {
    if (siteSettings) {
      saveSiteSettings(siteSettings);
      alert("Configuracoes salvas com sucesso! Recarregue a pagina para ver as mudancas.");
    }
  };

  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    if (siteSettings) {
      setSiteSettings({ ...siteSettings, [key]: value });
    }
  };

  const statusColors: Record<Appointment["status"], string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    completed: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
  };

  const statusLabels: Record<Appointment["status"], string> = {
    pending: "Pendente",
    confirmed: "Confirmado",
    completed: "Concluido",
    rejected: "Recusado",
  };

  // Stats calculations
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayAppointments = appointments.filter(
    (a) => a.date === todayStr && a.status !== "rejected"
  );
  const pendingAppointments = appointments.filter((a) => a.status === "pending");
  const completedAppointments = appointments.filter((a) => a.status === "completed");
  const totalLifetimeAppointments = appointments.length;

  // Dashboard calculations
  const getFilteredStats = () => {
    if (selectedMonth === 0) {
      return dashboardStats.filter(s => s.year === selectedYear);
    }
    return dashboardStats.filter(s => s.year === selectedYear && s.month === selectedMonth);
  };

  const filteredStats = getFilteredStats();
  const totalCuts = filteredStats.reduce((sum, s) => sum + s.totalCuts, 0);
  const totalRevenue = filteredStats.reduce((sum, s) => sum + s.totalRevenue, 0);

  const availableYears = [...new Set(dashboardStats.map(s => s.year))];
  if (!availableYears.includes(new Date().getFullYear())) {
    availableYears.push(new Date().getFullYear());
  }

  const monthNames = [
    "Ano Completo", "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Average rating
  const avgEstablishmentRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.establishmentRating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Scissors className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">
              Admin {siteSettings?.logoName || "BarberPro"}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 border-border text-foreground bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {todayAppointments.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {pendingAppointments.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Historico
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totalLifetimeAppointments}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Avaliacao
              </CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {avgEstablishmentRating}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <ScrollArea className="w-full">
            <TabsList className="bg-secondary inline-flex w-max">
              <TabsTrigger value="appointments" className="text-xs sm:text-sm">Agendamentos</TabsTrigger>
              <TabsTrigger value="services" className="text-xs sm:text-sm">Servicos</TabsTrigger>
              <TabsTrigger value="barbers" className="text-xs sm:text-sm">Barbeiros</TabsTrigger>
              <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm">Configuracoes</TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Agendamentos</CardTitle>
                <CardDescription>
                  Gerencie todos os agendamentos da barbearia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Cliente</TableHead>
                        <TableHead className="text-muted-foreground hidden sm:table-cell">Telefone</TableHead>
                        <TableHead className="text-muted-foreground">Servico</TableHead>
                        <TableHead className="text-muted-foreground hidden md:table-cell">Barbeiro</TableHead>
                        <TableHead className="text-muted-foreground">Data/Hora</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Acoes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-8 text-center text-muted-foreground"
                          >
                            Nenhum agendamento encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        [...appointments].reverse().map((appointment) => (
                          <TableRow key={appointment.id} className="border-border">
                            <TableCell>
                              <p className="font-medium text-foreground text-sm">
                                {appointment.clientName}
                              </p>
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {appointment.clientPhone}
                              </p>
                            </TableCell>
                            <TableCell className="text-foreground hidden sm:table-cell text-sm">
                              {appointment.clientPhone}
                            </TableCell>
                            <TableCell className="text-foreground text-sm">
                              {getServiceName(appointment.serviceId)}
                            </TableCell>
                            <TableCell className="text-foreground hidden md:table-cell text-sm">
                              {getBarberName(appointment.barberId)}
                            </TableCell>
                            <TableCell className="text-foreground text-sm">
                              <span className="hidden sm:inline">{appointment.date}</span>
                              <span className="sm:hidden">{appointment.date.slice(5)}</span>
                              <br />
                              <span className="text-muted-foreground">{appointment.time}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[appointment.status]}>
                                {statusLabels[appointment.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                <Select
                                  value={appointment.status}
                                  onValueChange={(value) =>
                                    handleStatusChange(
                                      appointment.id,
                                      value as Appointment["status"]
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-8 w-24 sm:w-28 border-border bg-secondary text-foreground text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="border-border bg-card">
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="confirmed">Confirmado</SelectItem>
                                    <SelectItem value="completed">Concluido</SelectItem>
                                    <SelectItem value="rejected">Recusado</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-foreground">Servicos</CardTitle>
                  <CardDescription>
                    Gerencie os servicos oferecidos pela barbearia.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => openServiceDialog()}
                  className="gap-2 bg-primary text-primary-foreground w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Novo Servico
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <Card key={service.id} className="border-border bg-secondary/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{service.name}</h3>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openServiceDialog(service)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteService(service.id)}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {formatDuration(service.duration)}
                          </span>
                          <span className="font-bold text-primary">
                            R$ {service.price.toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Barbers Tab */}
          <TabsContent value="barbers">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-foreground">Barbeiros</CardTitle>
                  <CardDescription>
                    Gerencie a equipe de barbeiros.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => openBarberDialog()}
                  className="gap-2 bg-primary text-primary-foreground w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Novo Barbeiro
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {barbers.map((barber) => (
                    <Card key={barber.id} className="border-border bg-secondary/30">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-14 w-14 border-2 border-primary/30">
                            {barber.avatar ? (
                              <AvatarImage src={barber.avatar || "/placeholder.svg"} alt={barber.name} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {barber.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground">{barber.name}</h3>
                                <p className="text-sm text-primary">{barber.specialty}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openBarberDialog(barber)}
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteBarber(barber.id)}
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span className="text-sm text-foreground">{barber.rating?.toFixed(1) || "5.0"}</span>
                              <span className="text-xs text-muted-foreground">({barber.totalRatings || 0})</span>
                            </div>
                            <Badge
                              className={`mt-2 ${
                                barber.available
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {barber.available ? "Disponivel" : "Indisponivel"}
                            </Badge>
                          </div>
                        </div>
                        {barber.serviceIds && barber.serviceIds.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {barber.serviceIds.slice(0, 3).map((sid) => (
                              <Badge key={sid} variant="outline" className="text-xs border-border">
                                {getServiceName(sid)}
                              </Badge>
                            ))}
                            {barber.serviceIds.length > 3 && (
                              <Badge variant="outline" className="text-xs border-border">
                                +{barber.serviceIds.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Dashboard Financeiro
                    </CardTitle>
                    <CardDescription>
                      Acompanhe o desempenho da barbearia.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                      <SelectTrigger className="w-24 border-border bg-secondary text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card">
                        {availableYears.sort((a, b) => b - a).map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                      <SelectTrigger className="w-32 border-border bg-secondary text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card">
                        {monthNames.map((name, index) => (
                          <SelectItem key={index} value={index.toString()}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  <Card className="border-border bg-secondary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Scissors className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cortes Realizados</p>
                          <p className="text-2xl font-bold text-foreground">{totalCuts}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-secondary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                          <DollarSign className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Receita Total</p>
                          <p className="text-2xl font-bold text-foreground">R$ {totalRevenue.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-secondary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                          <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Concluidos</p>
                          <p className="text-2xl font-bold text-foreground">{completedAppointments.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-secondary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avaliacoes</p>
                          <p className="text-2xl font-bold text-foreground">{reviews.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedMonth === 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Detalhamento Mensal - {selectedYear}</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border">
                            <TableHead className="text-muted-foreground">Mes</TableHead>
                            <TableHead className="text-muted-foreground">Cortes</TableHead>
                            <TableHead className="text-muted-foreground">Receita</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
                            const monthStat = dashboardStats.find(s => s.year === selectedYear && s.month === month);
                            return (
                              <TableRow key={month} className="border-border">
                                <TableCell className="text-foreground">{monthNames[month]}</TableCell>
                                <TableCell className="text-foreground">{monthStat?.totalCuts || 0}</TableCell>
                                <TableCell className="text-foreground">R$ {(monthStat?.totalRevenue || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <h3 className="font-semibold text-foreground mb-4">Ultimas Avaliacoes</h3>
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhuma avaliacao ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {[...reviews].reverse().slice(0, 5).map((review) => (
                        <Card key={review.id} className="border-border bg-secondary/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-foreground">{review.clientName}</p>
                                <p className="text-sm text-muted-foreground">
                                  Barbeiro: {getBarberName(review.barberId)}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-primary text-primary" />
                                  <span className="text-sm text-foreground">{review.establishmentRating}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(review.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="mt-2 text-sm text-muted-foreground italic">&quot;{review.comment}&quot;</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Configuracoes do Site
                </CardTitle>
                <CardDescription>
                  Personalize as informacoes do site. As alteracoes serao aplicadas para todos os usuarios.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {siteSettings && (
                  <>
                    {/* Logo & Branding */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground border-b border-border pb-2">Logo e Marca</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label className="text-foreground">Nome da Logo</Label>
                          <Input
                            value={siteSettings.logoName}
                            onChange={(e) => updateSetting("logoName", e.target.value)}
                            className="mt-1 border-border bg-secondary text-foreground"
                            placeholder="BarberPro"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Tagline do Header</Label>
                          <Input
                            value={siteSettings.headerTagline}
                            onChange={(e) => updateSetting("headerTagline", e.target.value)}
                            className="mt-1 border-border bg-secondary text-foreground"
                            placeholder="Barbearia Premium desde 2015"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground border-b border-border pb-2">Cores do Site</h3>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <Label className="text-foreground mb-3 block">Cor Principal (Botoes, Destaques)</Label>
                          <div className="grid grid-cols-6 gap-2">
                            {colorPresets.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => updateSetting("primaryColor", color.value)}
                                className={`h-8 w-8 rounded-md border-2 transition-all ${
                                  siteSettings.primaryColor === color.value
                                    ? "border-white scale-110"
                                    : "border-transparent hover:scale-105"
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Input
                              type="color"
                              value={siteSettings.primaryColor}
                              onChange={(e) => updateSetting("primaryColor", e.target.value)}
                              className="h-8 w-12 p-0 border-border cursor-pointer"
                            />
                            <Input
                              value={siteSettings.primaryColor}
                              onChange={(e) => updateSetting("primaryColor", e.target.value)}
                              className="flex-1 border-border bg-secondary text-foreground text-sm"
                              placeholder="#d4a855"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-foreground mb-3 block">Cor Secundaria (Acentos)</Label>
                          <div className="grid grid-cols-6 gap-2">
                            {colorPresets.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => updateSetting("secondaryColor", color.value)}
                                className={`h-8 w-8 rounded-md border-2 transition-all ${
                                  siteSettings.secondaryColor === color.value
                                    ? "border-white scale-110"
                                    : "border-transparent hover:scale-105"
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Input
                              type="color"
                              value={siteSettings.secondaryColor}
                              onChange={(e) => updateSetting("secondaryColor", e.target.value)}
                              className="h-8 w-12 p-0 border-border cursor-pointer"
                            />
                            <Input
                              value={siteSettings.secondaryColor}
                              onChange={(e) => updateSetting("secondaryColor", e.target.value)}
                              className="flex-1 border-border bg-secondary text-foreground text-sm"
                              placeholder="#c75a3a"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-foreground mb-3 block">Cor de Fundo do Site</Label>
                        <div className="grid grid-cols-8 gap-2 mb-2">
                          {bgColorPresets.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => updateSetting("backgroundColor", color.value)}
                              className={`h-8 w-full rounded-md border-2 transition-all ${
                                siteSettings.backgroundColor === color.value
                                  ? "border-white scale-105"
                                  : "border-transparent hover:scale-105"
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={siteSettings.backgroundColor}
                            onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                            className="h-8 w-12 p-0 border-border cursor-pointer"
                          />
                          <Input
                            value={siteSettings.backgroundColor}
                            onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                            className="flex-1 border-border bg-secondary text-foreground text-sm"
                            placeholder="#1a1a1f"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hero Section */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground border-b border-border pb-2">Secao Principal (Hero)</h3>
                      <div>
                        <Label className="text-foreground">Titulo Principal</Label>
                        <p className="text-xs text-muted-foreground mb-1">Exemplo: &quot;Estilo e Precisao em Cada Corte&quot;</p>
                        <Input
                          value={siteSettings.heroTitle}
                          onChange={(e) => updateSetting("heroTitle", e.target.value)}
                          className="border-border bg-secondary text-foreground"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Descricao do Hero</Label>
                        <Textarea
                          value={siteSettings.heroDescription}
                          onChange={(e) => updateSetting("heroDescription", e.target.value)}
                          className="mt-1 border-border bg-secondary text-foreground"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Anos de Experiencia</Label>
                        <Input
                          type="number"
                          value={siteSettings.yearsExperience}
                          onChange={(e) => updateSetting("yearsExperience", parseInt(e.target.value) || 0)}
                          className="mt-1 border-border bg-secondary text-foreground w-24"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground mb-2 block">Imagem de Fundo do Hero (opcional)</Label>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <input
                              type="file"
                              ref={heroFileInputRef}
                              onChange={handleHeroImageUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => heroFileInputRef.current?.click()}
                              className="w-full border-border text-foreground bg-transparent gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Fazer Upload de Imagem
                            </Button>
                          </div>
                          {siteSettings.heroBackgroundImage && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => updateSetting("heroBackgroundImage", "")}
                              className="border-destructive text-destructive bg-transparent gap-2"
                            >
                              <X className="h-4 w-4" />
                              Remover Imagem
                            </Button>
                          )}
                        </div>
                        {siteSettings.heroBackgroundImage && (
                          <div className="mt-4">
                            <div className="relative w-full max-w-md rounded-lg overflow-hidden border border-border">
                              <img
                                src={siteSettings.heroBackgroundImage || "/placeholder.svg"}
                                alt="Preview do fundo"
                                className="w-full h-32 object-cover"
                                style={{ filter: `blur(${siteSettings.heroBackgroundBlur || 0}px)` }}
                              />
                            </div>
                            <div className="mt-3">
                              <Label className="text-foreground">Intensidade do Blur: {siteSettings.heroBackgroundBlur || 0}px</Label>
                              <input
                                type="range"
                                min="0"
                                max="20"
                                value={siteSettings.heroBackgroundBlur || 0}
                                onChange={(e) => updateSetting("heroBackgroundBlur", parseInt(e.target.value))}
                                className="w-full mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground border-b border-border pb-2">Secao Sobre Nos</h3>
                      <div>
                        <Label className="text-foreground">Titulo</Label>
                        <Input
                          value={siteSettings.aboutTitle}
                          onChange={(e) => updateSetting("aboutTitle", e.target.value)}
                          className="mt-1 border-border bg-secondary text-foreground"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Descricao</Label>
                        <Textarea
                          value={siteSettings.aboutDescription}
                          onChange={(e) => updateSetting("aboutDescription", e.target.value)}
                          className="mt-1 border-border bg-secondary text-foreground"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Nossa Missao</Label>
                        <Textarea
                          value={siteSettings.aboutMission}
                          onChange={(e) => updateSetting("aboutMission", e.target.value)}
                          className="mt-1 border-border bg-secondary text-foreground"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Nossa Visao</Label>
                        <Textarea
                          value={siteSettings.aboutVision}
                          onChange={(e) => updateSetting("aboutVision", e.target.value)}
                          className="mt-1 border-border bg-secondary text-foreground"
                          rows={2}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSaveSiteSettings}
                      className="w-full sm:w-auto bg-primary text-primary-foreground"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Salvar Configuracoes
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Service Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="border-border bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingService ? "Editar Servico" : "Novo Servico"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do servico abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Nome do Corte</Label>
              <Input
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="border-border bg-secondary text-foreground"
                placeholder="Ex: Corte Degrade"
              />
            </div>
            <div>
              <Label className="text-foreground">Descricao</Label>
              <Textarea
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                className="border-border bg-secondary text-foreground"
                placeholder="Descricao do servico"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Duracao (min)</Label>
                <Input
                  type="number"
                  value={serviceDuration}
                  onChange={(e) => setServiceDuration(e.target.value)}
                  className="border-border bg-secondary text-foreground"
                  placeholder="30"
                />
              </div>
              <div>
                <Label className="text-foreground">Preco (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  className="border-border bg-secondary text-foreground"
                  placeholder="45.00"
                />
              </div>
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Horarios Disponiveis (07:00 - 00:00)</Label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setServiceAvailableTimes(allTimeSlots)}
                  className="border-border text-foreground bg-transparent text-xs"
                >
                  Selecionar Todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setServiceAvailableTimes([])}
                  className="border-border text-foreground bg-transparent text-xs"
                >
                  Limpar Todos
                </Button>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1 max-h-60 overflow-y-auto p-2 border border-border rounded-lg">
                {allTimeSlots.map((time) => (
                  <label key={time} className="flex items-center gap-1 text-xs cursor-pointer">
                    <Checkbox
                      checked={serviceAvailableTimes.includes(time)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setServiceAvailableTimes([...serviceAvailableTimes, time].sort());
                        } else {
                          setServiceAvailableTimes(serviceAvailableTimes.filter(t => t !== time));
                        }
                      }}
                      className="h-3 w-3"
                    />
                    <span className="text-foreground">{time}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setServiceDialogOpen(false)}
              className="border-border text-foreground bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveService}
              className="bg-primary text-primary-foreground"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barber Dialog */}
      <Dialog open={barberDialogOpen} onOpenChange={setBarberDialogOpen}>
        <DialogContent className="border-border bg-card max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingBarber ? "Editar Barbeiro" : "Novo Barbeiro"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do barbeiro abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Nome</Label>
              <Input
                value={barberName}
                onChange={(e) => setBarberName(e.target.value)}
                className="border-border bg-secondary text-foreground"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label className="text-foreground">Especialidade</Label>
              <Input
                value={barberSpecialty}
                onChange={(e) => setBarberSpecialty(e.target.value)}
                className="border-border bg-secondary text-foreground"
                placeholder="Ex: Degrade & Fade"
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Foto do Barbeiro (opcional)</Label>
              <input
                type="file"
                ref={barberFileInputRef}
                onChange={handleBarberImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/30">
                  {barberAvatar ? (
                    <AvatarImage src={barberAvatar || "/placeholder.svg"} alt="Preview" />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <ImageIcon className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => barberFileInputRef.current?.click()}
                    className="border-border text-foreground bg-transparent gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Fazer Upload
                  </Button>
                  {barberAvatar && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBarberAvatar("")}
                      className="border-destructive text-destructive bg-transparent gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="barber-available"
                checked={barberAvailable}
                onCheckedChange={(checked) => setBarberAvailable(checked as boolean)}
              />
              <Label htmlFor="barber-available" className="text-foreground">Disponivel para agendamentos</Label>
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Servicos que pode realizar</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {services.map((service) => (
                  <label key={service.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={barberServiceIds.includes(service.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBarberServiceIds([...barberServiceIds, service.id]);
                        } else {
                          setBarberServiceIds(barberServiceIds.filter(id => id !== service.id));
                        }
                      }}
                    />
                    <span className="text-foreground">{service.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBarberDialogOpen(false)}
              className="border-border text-foreground bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveBarber}
              className="bg-primary text-primary-foreground"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setCompletingAppointment(null);
          loadData();
        }}
        appointment={completingAppointment}
        barber={completingAppointment ? getBarberById(completingAppointment.barberId) : null}
      />
    </div>
  );
}
