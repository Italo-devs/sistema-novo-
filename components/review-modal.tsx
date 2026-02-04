"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Check } from "lucide-react";
import { addReview } from "@/lib/store";
import type { Appointment, Barber } from "@/lib/types";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  barber: Barber | null;
}

export function ReviewModal({ isOpen, onClose, appointment, barber }: ReviewModalProps) {
  const [establishmentRating, setEstablishmentRating] = useState(5);
  const [barberRating, setBarberRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!appointment || !barber) return;

    addReview({
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      barberId: barber.id,
      establishmentRating,
      barberRating,
      comment: comment || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEstablishmentRating(5);
      setBarberRating(5);
      setComment("");
      onClose();
    }, 2000);
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (v: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-foreground">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Obrigado!</h3>
            <p className="mt-2 text-muted-foreground">
              Sua avaliacao foi enviada com sucesso.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Avalie seu atendimento</DialogTitle>
          <DialogDescription>
            Ola {appointment?.clientName}! Como foi sua experiencia?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <StarRating
            value={establishmentRating}
            onChange={setEstablishmentRating}
            label="Avaliacao do Estabelecimento"
          />

          <StarRating
            value={barberRating}
            onChange={setBarberRating}
            label={`Avaliacao de ${barber?.name || "Barbeiro"}`}
          />

          <div className="space-y-2">
            <Label className="text-foreground">Comentario (opcional)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Deixe um comentario sobre sua experiencia..."
              className="border-border bg-secondary text-foreground"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className="w-full bg-primary text-primary-foreground"
          >
            Enviar Avaliacao
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
