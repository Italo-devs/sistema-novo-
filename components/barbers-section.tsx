"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBarbers, getServices } from "@/lib/store";
import type { Barber, Service } from "@/lib/types";
import { Star } from "lucide-react";

export function BarbersSection() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    setBarbers(getBarbers());
    setServices(getServices());
  }, []);

  const getBarberServices = (barber: Barber) => {
    if (!barber.serviceIds) return [];
    return services.filter(s => barber.serviceIds.includes(s.id));
  };

  return (
    <section id="barbers" className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            Nossa Equipe
          </Badge>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Barbeiros Especialistas
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Profissionais experientes e apaixonados pelo que fazem, prontos para
            oferecer o melhor atendimento.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.map((barber) => (
            <Card
              key={barber.id}
              className="group overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="mb-4 h-24 w-24 border-2 border-primary/30 transition-all group-hover:border-primary">
                    {barber.avatar ? (
                      <AvatarImage src={barber.avatar || "/placeholder.svg"} alt={barber.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                      {barber.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mb-1 text-xl font-semibold text-foreground">
                    {barber.name}
                  </h3>
                  <p className="mb-3 text-sm text-primary">{barber.specialty}</p>
                  
                  {/* Real Rating Display */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(barber.rating || 0)
                              ? "fill-primary text-primary"
                              : i < (barber.rating || 0)
                              ? "fill-primary/50 text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {(barber.rating || 0).toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({barber.totalRatings || 0})
                    </span>
                  </div>

                  {/* Services tags */}
                  <div className="mb-4 flex flex-wrap justify-center gap-1">
                    {getBarberServices(barber).slice(0, 3).map((service) => (
                      <Badge
                        key={service.id}
                        variant="outline"
                        className="border-border bg-secondary/50 text-xs text-muted-foreground"
                      >
                        {service.name}
                      </Badge>
                    ))}
                    {(barber.serviceIds?.length || 0) > 3 && (
                      <Badge
                        variant="outline"
                        className="border-border bg-secondary/50 text-xs text-muted-foreground"
                      >
                        +{(barber.serviceIds?.length || 0) - 3}
                      </Badge>
                    )}
                  </div>

                  <Badge
                    variant={barber.available ? "default" : "secondary"}
                    className={
                      barber.available
                        ? "bg-green-500/20 text-green-400"
                        : "bg-secondary text-muted-foreground"
                    }
                  >
                    {barber.available ? "Disponivel" : "Indisponivel"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
