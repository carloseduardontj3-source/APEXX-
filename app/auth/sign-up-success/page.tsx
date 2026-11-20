import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

export default function SignUpSuccessPage() {
  return (
    <AuthCard
      title="Confirme seu e-mail"
      description="Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar sua conta."
    >
      <Link href="/auth/login" className="text-sm underline underline-offset-4">
        Voltar para o login
      </Link>
    </AuthCard>
  );
}
