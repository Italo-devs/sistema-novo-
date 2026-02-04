"use client";

import React from "react"
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, CheckCircle2, XCircle } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      setError("Link de verificação inválido");
      setIsVerifying(false);
      return;
    }

    verifyEmail(email, token);
  }, [searchParams]);

  const verifyEmail = async (email: string, token: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.verifyEmail, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao verificar email");
      }

      // Save token
      if (typeof window !== "undefined") {
        localStorage.setItem("barbershop_admin_token", data.token);
        localStorage.setItem("barbershop_admin_email", data.email);
        localStorage.setItem("barbershop_admin_auth", "authenticated");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao verificar email");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Scissors className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl text-foreground">
              Verificando Email...
            </CardTitle>
            <CardDescription>
              Aguarde enquanto verificamos sua conta
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-foreground">
              Email Verificado!
            </CardTitle>
            <CardDescription>
              Sua conta foi ativada com sucesso. Redirecionando para o dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-foreground">
            Erro na Verificação
          </CardTitle>
          <CardDescription>
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push("/admin")}
            variant="outline"
            className="w-full border-border text-foreground"
          >
            Voltar para Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Scissors className="h-12 w-12 text-primary animate-pulse" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
