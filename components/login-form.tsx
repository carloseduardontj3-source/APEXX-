"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, SubmitButton } from "@/components/auth-card";
import { createClient } from "@/lib/supabase/client";

function loginErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number };
  if (code === "email_not_confirmed") {
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  }
  if (code === "over_request_rate_limit" || status === 429) {
    return "Muitas tentativas. Aguarde um momento e tente novamente.";
  }
  if (code === "invalid_credentials") return "E-mail ou senha inválidos.";
  return "Algo deu errado. Tente novamente.";
}

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/conta";
}

export function LoginForm({ next }: { next: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(loginErrorMessage(error));
      setLoading(false);
      return;
    }
    router.push(safeNext(next));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field
        id="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Field
        id="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <SubmitButton loading={loading}>{loading ? "Entrando..." : "Entrar"}</SubmitButton>
      <p className="text-center text-sm text-muted">
        Não tem conta?{" "}
        <Link href="/auth/sign-up" className="text-foreground underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
