import Link from "next/link";
import { PricingCards } from "@/components/pricing-cards";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-16 md:py-24">
      <section className="flex max-w-2xl flex-col gap-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Login · Banco de dados · Pagamentos
        </p>
        <h1 className="text-balance text-4xl font-bold leading-tight md:text-6xl">
          Chegue ao topo com a APEXX.
        </h1>
        <p className="text-pretty text-lg text-muted">
          Crie sua conta em segundos, escolha um plano e pague com segurança via Stripe.
          Seus pedidos ficam salvos na sua conta.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/auth/sign-up"
            className="rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Criar conta grátis
          </Link>
          <Link
            href="#planos"
            className="rounded-md border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-surface"
          >
            Ver planos
          </Link>
        </div>
      </section>

      <section id="planos" aria-labelledby="planos-titulo" className="flex scroll-mt-24 flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 id="planos-titulo" className="text-2xl font-bold md:text-3xl">
            Planos
          </h2>
          <p className="text-muted">Escolha o plano ideal. Você precisa estar logado para pagar.</p>
        </div>
        <PricingCards />
      </section>
    </div>
  );
}
