"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getSiteSettings } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";
import { Target, Eye } from "lucide-react";

export function AboutSection() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    setSettings(getSiteSettings());
  }, []);

  if (!settings) return null;

  return (
    <section id="about" className="bg-card py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            Sobre Nos
          </Badge>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            {settings.aboutTitle}
          </h2>
          <p className="mx-auto max-w-3xl text-muted-foreground leading-relaxed">
            {settings.aboutDescription}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-secondary/30 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">Nossa Missao</h3>
            <p className="text-muted-foreground leading-relaxed">
              {settings.aboutMission}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">Nossa Visao</h3>
            <p className="text-muted-foreground leading-relaxed">
              {settings.aboutVision}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
