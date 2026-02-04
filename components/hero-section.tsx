"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { getSiteSettings, getSatisfiedClientsCount, getAverageEstablishmentRating } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";

export function HeroSection() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [satisfiedClients, setSatisfiedClients] = useState(2000);
  const [avgRating, setAvgRating] = useState(4.9);

  useEffect(() => {
    setSettings(getSiteSettings());
    setSatisfiedClients(getSatisfiedClientsCount());
    setAvgRating(getAverageEstablishmentRating());
  }, []);

  if (!settings) return null;

  const hasBackgroundImage = settings.heroBackgroundImage && settings.heroBackgroundImage.length > 0;

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: settings.backgroundColor }}>
      {hasBackgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${settings.heroBackgroundImage})`,
            filter: `blur(${settings.heroBackgroundBlur || 0}px)`,
            transform: 'scale(1.1)',
          }}
        />
      )}
      <div 
        className="absolute inset-0" 
        style={{ 
          background: hasBackgroundImage 
            ? `linear-gradient(to bottom, ${settings.backgroundColor}CC, ${settings.backgroundColor}EE)`
            : `radial-gradient(ellipse at top, ${settings.primaryColor}15, transparent)`
        }}
      />
      
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div 
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2"
            style={{ 
              borderColor: `${settings.primaryColor}50`,
              backgroundColor: `${settings.primaryColor}15`
            }}
          >
            <Star className="h-4 w-4" style={{ color: settings.primaryColor }} />
            <span className="text-sm font-medium" style={{ color: settings.primaryColor }}>
              {settings.headerTagline}
            </span>
          </div>

          <h1 className="mb-6 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-6xl">
            {settings.heroTitle}
          </h1>

          <p className="mb-8 text-pretty text-base text-gray-300 sm:text-lg md:text-xl">
            {settings.heroDescription}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="w-full gap-2 sm:w-auto"
              style={{ backgroundColor: settings.primaryColor, color: '#000' }}
              onClick={() => {
                document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Agendar Horario
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent"
              style={{ 
                borderColor: `${settings.primaryColor}80`,
                color: '#fff'
              }}
              onClick={() => {
                document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Ver Servicos
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold sm:text-3xl" style={{ color: settings.primaryColor }}>{settings.yearsExperience}+</p>
              <p className="text-xs text-gray-400 sm:text-sm">Anos de Experiencia</p>
            </div>
            <div className="h-10 w-px bg-gray-700 sm:h-12" />
            <div className="text-center">
              <p className="text-2xl font-bold sm:text-3xl" style={{ color: settings.primaryColor }}>{satisfiedClients.toLocaleString()}+</p>
              <p className="text-xs text-gray-400 sm:text-sm">Clientes Satisfeitos</p>
            </div>
            <div className="h-10 w-px bg-gray-700 sm:h-12" />
            <div className="text-center">
              <p className="text-2xl font-bold sm:text-3xl" style={{ color: settings.primaryColor }}>{avgRating}</p>
              <p className="text-xs text-gray-400 sm:text-sm">Avaliacao Media</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
