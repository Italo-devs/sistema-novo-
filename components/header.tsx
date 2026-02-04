"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Scissors } from "lucide-react";
import { getSiteSettings } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    setSettings(getSiteSettings());
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Scissors className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
          <span className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {settings?.logoName || "BarberPro"}
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          <button
            type="button"
            onClick={() => scrollToSection("services")}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Servicos
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("booking")}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Agendar
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("barbers")}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Equipe
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("about")}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Sobre
          </button>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-gold-dark"
            onClick={() => scrollToSection("booking")}
          >
            Agendar Agora
          </Button>
        </div>

        <button
          type="button"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="flex flex-col gap-4 px-4 py-6">
            <button
              type="button"
              onClick={() => scrollToSection("services")}
              className="text-left text-sm font-medium text-muted-foreground"
            >
              Servicos
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("booking")}
              className="text-left text-sm font-medium text-muted-foreground"
            >
              Agendar
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("barbers")}
              className="text-left text-sm font-medium text-muted-foreground"
            >
              Equipe
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("about")}
              className="text-left text-sm font-medium text-muted-foreground"
            >
              Sobre
            </button>
            <Button 
              className="w-full bg-primary text-primary-foreground"
              onClick={() => scrollToSection("booking")}
            >
              Agendar Agora
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
