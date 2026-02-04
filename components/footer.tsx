"use client";

import { useEffect, useState } from "react";
import { Scissors, MapPin, Phone, Instagram } from "lucide-react";
import Link from "next/link";
import { getSiteSettings } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    setSettings(getSiteSettings());
  }, []);

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">
                {settings?.logoName || "BarberPro"}
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-md">
              {settings?.aboutDescription?.slice(0, 150) || "Experiencia premium em barbearia. Estilo, precisao e atencao aos detalhes."}...
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-foreground">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                Rua das Tesouras, 123 - Centro
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Instagram className="h-4 w-4 text-primary flex-shrink-0" />
                @barberpro
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} {settings?.logoName || "BarberPro"}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
