import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Entrar | APEXX" };

export default async function LoginPage({ searchParams }: PageProps<"/auth/login">) {
  const { next } = await searchParams;
  return (
    <AuthCard title="Entrar" description="Acesse sua conta APEXX.">
      <LoginForm next={typeof next === "string" ? next : null} />
    </AuthCard>
  );
}
