import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-mono text-lg font-bold tracking-widest">
          APEXX<span className="text-accent">.</span>
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-4 text-sm">
          <Link href="/#planos" className="text-muted transition-colors hover:text-foreground">
            Planos
          </Link>
          {user ? (
            <>
              <Link href="/conta" className="text-muted transition-colors hover:text-foreground">
                Minha conta
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-surface"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-muted transition-colors hover:text-foreground">
                Entrar
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-md bg-accent px-3 py-1.5 font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
