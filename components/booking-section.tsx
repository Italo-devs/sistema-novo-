"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getServices,
  getBarbers,
  getAvailableTimeSlots,
  addAppointment,
  isTimeSlotAvailable,
} from "@/lib/store";
import type { Service, Barber } from "@/lib/types";
import { Check, Clock, User, Calendar as CalendarIcon, Scissors, ArrowRight, Phone } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { formatDuration } from "@/lib/time-utils";

export function BookingSection() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    setServices(getServices());
    setBarbers(getBarbers());
  }, []);

  useEffect(() => {
    if (selectedDate && selectedBarber) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const slots = getAvailableTimeSlots(dateStr, selectedBarber, selectedService);
      setAvailableSlots(slots);
      if (!slots.includes(selectedTime)) {
        setSelectedTime("");
      }
    }
  }, [selectedDate, selectedBarber, selectedService, selectedTime]);

  const selectedServiceData = services.find((s) => s.id === selectedService);
  const selectedBarberData = barbers.find((b) => b.id === selectedBarber);

  const filteredBarbers = selectedService
    ? barbers.filter((b) => b.available && b.serviceIds?.includes(selectedService))
    : barbers.filter((b) => b.available);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedService || !selectedBarber || !selectedTime) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    if (!isTimeSlotAvailable(dateStr, selectedTime, selectedBarber)) {
      alert("Este horario ja foi reservado. Por favor, escolha outro horario.");
      setAvailableSlots(getAvailableTimeSlots(dateStr, selectedBarber, selectedService));
      setSelectedTime("");
      return;
    }

    setIsSubmitting(true);
    try {
      addAppointment({
        clientName,
        clientPhone,
        clientEmail: "",
        serviceId: selectedService,
        barberId: selectedBarber,
        date: dateStr,
        time: selectedTime,
        status: "pending",
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setStep(1);
        setSelectedService("");
        setSelectedBarber("");
        setSelectedDate(undefined);
        setSelectedTime("");
        setClientName("");
        setClientPhone("");
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = selectedService && selectedBarber;
  const canProceedStep2 = selectedDate && selectedTime;
  const canProceedStep3 = clientName && clientPhone;

  if (bookingSuccess) {
    return (
      <section id="booking" className="bg-background py-20">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <Card className="border-border bg-card">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">
                Agendamento Realizado!
              </h2>
              <p className="mb-6 text-muted-foreground">
                Seu horario foi reservado com sucesso. Aguarde a confirmacao.
              </p>
              <div className="mx-auto max-w-sm rounded-lg bg-secondary/50 p-4 text-left">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Servico:</strong> {selectedServiceData?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Barbeiro:</strong> {selectedBarberData?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Data:</strong>{" "}
                  {selectedDate && format(selectedDate, "dd/MM/yyyy")} as {selectedTime}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="bg-background py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            Agendamento Online
          </Badge>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Agende seu Horario
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Escolha o servico, profissional, data e horario em apenas 3 passos.
          </p>
        </div>

        {/* Step Indicators */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => s < step && setStep(s)}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  s === step
                    ? "bg-primary text-primary-foreground"
                    : s < step
                    ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="h-5 w-5" /> : s}
              </button>
              {s < 3 && (
                <div
                  className={`mx-2 h-1 w-12 rounded transition-colors sm:w-20 ${
                    s < step ? "bg-primary" : "bg-secondary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <span className={step === 1 ? "text-primary font-medium" : "text-muted-foreground"}>
            Servico & Profissional
          </span>
          <span className={step === 2 ? "text-primary font-medium" : "text-muted-foreground"}>
            Data & Horario
          </span>
          <span className={step === 3 ? "text-primary font-medium" : "text-muted-foreground"}>
            Seus Dados
          </span>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-6 md:p-8">
            {/* Step 1: Service & Barber */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Scissors className="h-5 w-5 text-primary" />
                    Escolha o Servico
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setSelectedService(service.id);
                          setSelectedBarber("");
                        }}
                        className={`rounded-lg border p-4 text-left transition-all ${
                          selectedService === service.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-secondary/30 hover:border-primary/50"
                        }`}
                      >
                        <p className="font-medium text-foreground">{service.name}</p>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {service.duration} min
                          </span>
                          <span className="font-bold text-primary">
                            R$ {service.price.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedService && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                      <User className="h-5 w-5 text-primary" />
                      Escolha o Profissional
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredBarbers.map((barber) => (
                        <button
                          key={barber.id}
                          type="button"
                          onClick={() => setSelectedBarber(barber.id)}
                          className={`rounded-lg border p-4 text-center transition-all ${
                            selectedBarber === barber.id
                              ? "border-primary bg-primary/10"
                              : "border-border bg-secondary/30 hover:border-primary/50"
                          }`}
                        >
                          <Avatar className="mx-auto mb-2 h-14 w-14 border-2 border-primary/30">
                            {barber.avatar ? (
                              <AvatarImage src={barber.avatar || "/placeholder.svg"} alt={barber.name} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {barber.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-medium text-foreground">{barber.name}</p>
                          <p className="text-xs text-primary">{barber.specialty}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="gap-2 bg-primary text-primary-foreground"
                  >
                    Proximo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Escolha a Data e Horario
                </h3>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <Label className="mb-3 block text-foreground">Data</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={ptBR}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today || date.getDay() === 0;
                      }}
                      className="rounded-lg border border-border"
                    />
                  </div>

                  <div>
                    <Label className="mb-3 block text-foreground">Horarios Disponiveis</Label>
                    {selectedDate ? (
                      availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              type="button"
                              variant={selectedTime === slot ? "default" : "outline"}
                              size="sm"
                              className={
                                selectedTime === slot
                                  ? "bg-primary text-primary-foreground"
                                  : "border-border text-foreground hover:border-primary hover:text-primary bg-transparent"
                              }
                              onClick={() => setSelectedTime(slot)}
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-lg bg-secondary/50 p-4 text-muted-foreground">
                          Nenhum horario disponivel para esta data.
                        </p>
                      )
                    ) : (
                      <p className="rounded-lg bg-secondary/50 p-4 text-muted-foreground">
                        Selecione uma data para ver os horarios.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-border text-foreground bg-transparent"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="gap-2 bg-primary text-primary-foreground"
                  >
                    Proximo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Info */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Phone className="h-5 w-5 text-primary" />
                  Seus Dados
                </h3>

                <div className="mx-auto max-w-md space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">Nome Completo</Label>
                    <Input
                      id="name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Seu nome"
                      className="mt-1 border-border bg-secondary/50 text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-foreground">Telefone / WhatsApp</Label>
                    <Input
                      id="phone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="mt-1 border-border bg-secondary/50 text-foreground"
                    />
                  </div>
                </div>

                <div className="mx-auto max-w-md rounded-lg bg-secondary/50 p-4">
                  <h4 className="mb-3 font-medium text-foreground">Resumo</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Servico:</span> {selectedServiceData?.name}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Barbeiro:</span> {selectedBarberData?.name}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Data:</span>{" "}
                      {selectedDate && format(selectedDate, "dd/MM/yyyy")} as {selectedTime}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Valor:</span>{" "}
                      <span className="text-primary font-semibold">
                        R$ {selectedServiceData?.price.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="border-border text-foreground bg-transparent"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceedStep3 || isSubmitting}
                    className="gap-2 bg-primary text-primary-foreground"
                  >
                    {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
