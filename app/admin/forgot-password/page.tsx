"use client";

import React from "react"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api-config";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao enviar email");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar email. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-foreground">
              Email Enviado!
            </CardTitle>
            <CardDescription>
              Se o email <strong>{email}</strong> estiver cadastrado, você receberá instruções para redefinir sua senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Verifique sua caixa de entrada (e spam).
              </p>
              <Button
                onClick={() => router.push("/admin")}
                variant="outline"
                className="w-full border-border text-foreground gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Scissors className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-foreground">
            Esqueceu a Senha?
          </CardTitle>
          <CardDescription>
            Digite seu email para receber instruções de redefinição
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="border-border bg-secondary/50 pl-10 text-foreground"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground"
            >
              {isLoading ? "Enviando..." : "Enviar Link de Redefinição"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/admin")}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
