"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  getServices,
  getBarbers,
  getAvailableTimeSlots,
  addAppointment,
} from "@/lib/store";
import type { Service, Barber } from "@/lib/types";
import { Check, Clock, User, Calendar as CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { formatDuration } from "@/lib/time-utils";

type Step = "service" | "barber" | "datetime" | "contact" | "confirm";

export function BookingForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("service");
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    setServices(getServices());
    setBarbers(getBarbers());
  }, []);

  useEffect(() => {
    if (selectedDate && selectedBarber) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const slots = getAvailableTimeSlots(dateStr, selectedBarber);
      setAvailableSlots(slots);
      if (!slots.includes(selectedTime)) {
        setSelectedTime("");
      }
    }
  }, [selectedDate, selectedBarber, selectedTime]);

  const selectedServiceData = services.find((s) => s.id === selectedService);
  const selectedBarberData = barbers.find((b) => b.id === selectedBarber);

  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "Servico" },
    { key: "barber", label: "Barbeiro" },
    { key: "datetime", label: "Data/Hora" },
    { key: "contact", label: "Contato" },
    { key: "confirm", label: "Confirmar" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const canProceed = () => {
    switch (step) {
      case "service":
        return !!selectedService;
      case "barber":
        return !!selectedBarber;
      case "datetime":
        return !!selectedDate && !!selectedTime;
      case "contact":
        return !!clientName && !!clientPhone;
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex].key);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex].key);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate) return;

    setIsSubmitting(true);
    try {
      addAppointment({
        clientName,
        clientPhone,
        clientEmail,
        serviceId: selectedService,
        barberId: selectedBarber,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        status: "pending",
      });

      setBookingSuccess(true);
    } catch (error) {
      console.error("Error creating appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <Card className="mx-auto max-w-lg border-border bg-card">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Agendamento Confirmado!
          </h2>
          <p className="mb-6 text-muted-foreground">
            Seu agendamento foi realizado com sucesso. Em breve voce recebera uma
            confirmacao.
          </p>
          <div className="mb-6 rounded-lg bg-secondary/50 p-4 text-left">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Servico:</strong>{" "}
              {selectedServiceData?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Barbeiro:</strong>{" "}
              {selectedBarberData?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Data:</strong>{" "}
              {selectedDate && format(selectedDate, "dd/MM/yyyy")}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Horario:</strong> {selectedTime}
            </p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-primary text-primary-foreground"
          >
            Voltar ao Inicio
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((s, index) => (
          <div key={s.key} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                index <= currentStepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {index < currentStepIndex ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-1 w-8 rounded transition-colors ${
                  index < currentStepIndex ? "bg-primary" : "bg-secondary"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">
            {step === "service" && "Escolha o Servico"}
            {step === "barber" && "Escolha o Barbeiro"}
            {step === "datetime" && "Escolha Data e Horario"}
            {step === "contact" && "Seus Dados"}
            {step === "confirm" && "Confirmar Agendamento"}
          </CardTitle>
          <CardDescription>
            {step === "service" && "Selecione o servico que deseja agendar"}
            {step === "barber" && "Selecione o profissional de sua preferencia"}
            {step === "datetime" && "Escolha a data e horario disponiveis"}
            {step === "contact" && "Informe seus dados para contato"}
            {step === "confirm" && "Revise os detalhes do seu agendamento"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Step: Service Selection */}
          {step === "service" && (
            <RadioGroup
              value={selectedService}
              onValueChange={setSelectedService}
              className="grid gap-4 md:grid-cols-2"
            >
              {services.map((service) => (
                <Label
                  key={service.id}
                  htmlFor={service.id}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    selectedService === service.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem
                      value={service.id}
                      id={service.id}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {service.duration} min
                        </span>
                        <span className="font-bold text-primary">
                          R$ {service.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          )}

          {/* Step: Barber Selection */}
          {step === "barber" && (
            <RadioGroup
              value={selectedBarber}
              onValueChange={setSelectedBarber}
              className="grid gap-4 md:grid-cols-3"
            >
              {barbers
                .filter((b) => b.available)
                .map((barber) => (
                  <Label
                    key={barber.id}
                    htmlFor={`barber-${barber.id}`}
                    className={`cursor-pointer rounded-lg border p-4 text-center transition-all ${
                      selectedBarber === barber.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/30 hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem
                      value={barber.id}
                      id={`barber-${barber.id}`}
                      className="sr-only"
                    />
                    <Avatar className="mx-auto mb-3 h-16 w-16 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                        {barber.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-foreground">{barber.name}</p>
                    <p className="text-sm text-primary">{barber.specialty}</p>
                    {selectedBarber === barber.id && (
                      <Badge className="mt-2 bg-primary text-primary-foreground">
                        Selecionado
                      </Badge>
                    )}
                  </Label>
                ))}
            </RadioGroup>
          )}

          {/* Step: Date & Time Selection */}
          {step === "datetime" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <Label className="mb-3 block text-foreground">
                  Selecione a Data
                </Label>
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
                <Label className="mb-3 block text-foreground">
                  Horarios Disponiveis
                </Label>
                {selectedDate ? (
                  availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          variant={selectedTime === slot ? "default" : "outline"}
                          className={
                            selectedTime === slot
                              ? "bg-primary text-primary-foreground"
                              : "border-border text-foreground hover:border-primary hover:text-primary"
                          }
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Nenhum horario disponivel para esta data.
                    </p>
                  )
                ) : (
                  <p className="text-muted-foreground">
                    Selecione uma data para ver os horarios disponiveis.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step: Contact Information */}
          {step === "contact" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-foreground">
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Seu nome"
                  className="mt-1 border-border bg-secondary/50 text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-foreground">
                  Telefone / WhatsApp *
                </Label>
                <Input
                  id="phone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="mt-1 border-border bg-secondary/50 text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground">
                  E-mail (opcional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-1 border-border bg-secondary/50 text-foreground"
                />
              </div>
            </div>
          )}

          {/* Step: Confirmation */}
          {step === "confirm" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <h3 className="mb-4 font-semibold text-foreground">
                  Resumo do Agendamento
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Servico</p>
                      <p className="font-medium text-foreground">
                        {selectedServiceData?.name} - R${" "}
                        {selectedServiceData?.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Barbeiro</p>
                      <p className="font-medium text-foreground">
                        {selectedBarberData?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data e Hora</p>
                      <p className="font-medium text-foreground">
                        {selectedDate && format(selectedDate, "dd/MM/yyyy")} as{" "}
                        {selectedTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-medium text-foreground">{clientName}</p>
                      <p className="text-sm text-muted-foreground">{clientPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={currentStepIndex === 0}
              className="gap-2 border-border text-foreground bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>

            {step === "confirm" ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-primary text-primary-foreground"
              >
                {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
                <Check className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={goNext}
                disabled={!canProceed()}
                className="gap-2 bg-primary text-primary-foreground"
              >
                Proximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
