import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

export default function AuthErrorPage() {
  return (
    <AuthCard
      title="Algo deu errado"
      description="Não foi possível concluir a autenticação. O link pode ter expirado."
    >
      <Link href="/auth/login" className="text-sm underline underline-offset-4">
        Tentar novamente
      </Link>
    </AuthCard>
  );
}
