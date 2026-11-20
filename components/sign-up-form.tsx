"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, SubmitButton } from "@/components/auth-card";
import { createClient } from "@/lib/supabase/client";

function signUpErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number };
  if (code === "weak_password") return "Escolha uma senha mais forte.";
  if (code === "email_address_invalid") {
    return "Use um e-mail real — domínios de exemplo ou teste não são aceitos.";
  }
  if (code === "email_address_not_authorized") {
    return "Não conseguimos enviar o e-mail de confirmação para esse endereço. Use outro.";
  }
  if (code === "validation_failed") return "Verifique os dados informados.";
  if (code === "over_email_send_rate_limit" || status === 429) {
    return "Muitas tentativas. Aguarde um momento e tente novamente.";
  }
  return "Não foi possível criar a conta. Tente novamente.";
}

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== repeatPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(signUpErrorMessage(error));
      setLoading(false);
      return;
    }
    router.push("/auth/sign-up-success");
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
        autoComplete="new-password"
        minLength={6}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Field
        id="repeat-password"
        label="Repita a senha"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
      />
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <SubmitButton loading={loading}>{loading ? "Criando conta..." : "Criar conta"}</SubmitButton>
      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/auth/login" className="text-foreground underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </form>
  );
}
