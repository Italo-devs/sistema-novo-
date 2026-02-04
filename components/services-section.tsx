"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServices } from "@/lib/store";
import type { Service } from "@/lib/types";
import { Clock, Scissors, Sparkles, Flame } from "lucide-react";
import { formatDuration } from "@/lib/time-utils";

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    setServices(getServices());
  }, []);

  const getIcon = (index: number) => {
    const icons = [
      <Scissors key="scissors" className="h-8 w-8" />,
      <Sparkles key="sparkles" className="h-8 w-8" />,
      <Flame key="flame" className="h-8 w-8" />,
    ];
    return icons[index % icons.length];
  };

  return (
    <section id="services" className="relative bg-card py-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2" />
      
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            Nossos Servicos
          </Badge>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Servicos Premium de Barbearia
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Tecnicas tradicionais combinadas com tendencias modernas.
            Cada servico e uma experiencia unica de cuidado pessoal.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card
              key={service.id}
              className="group relative border-border bg-gradient-to-br from-secondary/80 to-secondary/40 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 overflow-hidden"
            >
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                    {getIcon(index)}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      R$ {service.price.toFixed(0)}
                    </p>
                  </div>
                </div>

                <h3 className="mb-2 text-xl font-bold text-foreground">
                  {service.name}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{service.duration} minutos</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="border-primary/30 bg-primary/10 text-primary text-xs"
                  >
                    Premium
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom decorative line */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-primary/50" />
          <Scissors className="h-5 w-5 text-primary/50" />
          <div className="h-px w-12 bg-primary/50" />
        </div>
      </div>
    </section>
  );
}
