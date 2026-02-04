"use client";

import { useEffect } from "react";
import { getSiteSettings } from "./store";
import type { SiteSettings } from "./types";

/**
 * Converte cor hex para valores RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converte RGB para OKLCH (aproximado)
 */
function rgbToOklch(r: number, g: number, b: number): string {
  // Normalizar RGB para 0-1
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // Calcular luminância aproximada
  const lightness = 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;

  // Calcular chroma aproximado
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const chroma = (max - min) * 0.2;

  // Calcular hue aproximado
  let hue = 0;
  if (chroma !== 0) {
    if (max === rNorm) {
      hue = ((gNorm - bNorm) / (max - min)) * 60;
    } else if (max === gNorm) {
      hue = (2 + (bNorm - rNorm) / (max - min)) * 60;
    } else {
      hue = (4 + (rNorm - gNorm) / (max - min)) * 60;
    }
  }
  if (hue < 0) hue += 360;

  return `oklch(${lightness.toFixed(2)} ${chroma.toFixed(2)} ${hue.toFixed(0)})`;
}

/**
 * Aplica as cores do site dinamicamente
 */
export function applyDynamicColors(settings: SiteSettings) {
  if (typeof window === "undefined") return;

  const root = document.documentElement;

  // Converter cores principais
  const primaryRgb = hexToRgb(settings.primaryColor);
  const secondaryRgb = hexToRgb(settings.secondaryColor);
  const bgRgb = hexToRgb(settings.backgroundColor);

  if (primaryRgb) {
    const primaryOklch = rgbToOklch(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    root.style.setProperty("--primary", primaryOklch);
    root.style.setProperty("--ring", primaryOklch);
    root.style.setProperty("--chart-1", primaryOklch);
    root.style.setProperty("--sidebar-primary", primaryOklch);
    root.style.setProperty("--sidebar-ring", primaryOklch);
    root.style.setProperty("--gold", primaryOklch);
  }

  if (secondaryRgb) {
    const secondaryOklch = rgbToOklch(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    root.style.setProperty("--accent", secondaryOklch);
    root.style.setProperty("--chart-2", secondaryOklch);
    root.style.setProperty("--red-accent", secondaryOklch);
  }

  if (bgRgb) {
    const bgOklch = rgbToOklch(bgRgb.r, bgRgb.g, bgRgb.b);
    root.style.setProperty("--background", bgOklch);
    root.style.setProperty("--sidebar", bgOklch);

    // Ajustar cores relacionadas baseadas no fundo
    const lightnessValue = (bgRgb.r + bgRgb.g + bgRgb.b) / (3 * 255);
    const cardLightness = Math.min(lightnessValue + 0.04, 1);
    const borderLightness = Math.min(lightnessValue + 0.12, 1);

    root.style.setProperty("--card", `oklch(${cardLightness.toFixed(2)} 0.005 250)`);
    root.style.setProperty("--popover", `oklch(${(lightnessValue + 0.02).toFixed(2)} 0.005 250)`);
    root.style.setProperty("--secondary", `oklch(${(lightnessValue + 0.1).toFixed(2)} 0.005 250)`);
    root.style.setProperty("--muted", `oklch(${(lightnessValue + 0.1).toFixed(2)} 0.005 250)`);
    root.style.setProperty("--input", `oklch(${(lightnessValue + 0.1).toFixed(2)} 0.005 250)`);
    root.style.setProperty("--border", `oklch(${borderLightness.toFixed(2)} 0.005 250)`);
    root.style.setProperty("--sidebar-accent", `oklch(${(lightnessValue + 0.06).toFixed(2)} 0.005 250)`);
    root.style.setProperty("--sidebar-border", `oklch(${(lightnessValue + 0.13).toFixed(2)} 0.005 250)`);
  }
}

/**
 * Hook para aplicar cores dinamicamente
 */
export function ColorSystemProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const settings = getSiteSettings();
    applyDynamicColors(settings);

    // Observar mudanças no localStorage
    const handleStorageChange = () => {
      const updatedSettings = getSiteSettings();
      applyDynamicColors(updatedSettings);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return <>{children}</>;
}
