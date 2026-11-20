import Link from "next/link";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Minha conta | APEXX" };

type Order = {
  id: string;
  product_name: string;
  amount_in_cents: number;
  currency: string;
  status: string;
  created_at: string;
};

export default async function AccountPage({ searchParams }: PageProps<"/conta">) {
  const { sucesso } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/conta");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, product_name, amount_in_cents, currency, status, created_at")
    .order("created_at", { ascending: false })
    .returns<Order[]>();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Minha conta</h1>
        <p className="text-muted">{user.email}</p>
      </div>

      {sucesso && (
        <p role="status" className="rounded-md border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
          Pagamento confirmado! Seu pedido foi salvo.
        </p>
      )}

      <section aria-labelledby="pedidos" className="flex flex-col gap-4">
        <h2 id="pedidos" className="text-xl font-semibold">
          Meus pedidos
        </h2>
        {error ? (
          <p className="text-sm text-danger">Não foi possível carregar seus pedidos.</p>
        ) : orders && orders.length > 0 ? (
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex flex-col">
                  <span className="font-medium">Plano {order.product_name}</span>
                  <span className="text-sm text-muted">
                    {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-medium">
                    {formatPrice(order.amount_in_cents, order.currency)}
                  </span>
                  <span className="text-xs uppercase text-accent">
                    {order.status === "paid" ? "Pago" : order.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-6">
            <p className="text-muted">Você ainda não tem pedidos.</p>
            <Link
              href="/#planos"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Ver planos
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
