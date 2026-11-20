import { AuthCard } from "@/components/auth-card";
import { SignUpForm } from "@/components/sign-up-form";

export const metadata = { title: "Criar conta | APEXX" };

export default function SignUpPage() {
  return (
    <AuthCard title="Criar conta" description="Cadastre-se com e-mail e senha.">
      <SignUpForm />
    </AuthCard>
  );
}
