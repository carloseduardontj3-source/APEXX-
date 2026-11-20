"use server";

import { getProduct } from "@/lib/products";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Você precisa entrar para continuar.");
  return user;
}

export async function startCheckoutSession(productId: string) {
  const user = await requireUser();
  const product = getProduct(productId);
  if (!product) throw new Error("Produto não encontrado.");

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded_page",
    redirect_on_completion: "never",
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: { user_id: user.id, product_id: product.id },
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: `APEXX ${product.name}`,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
  });

  if (!session.client_secret) throw new Error("Falha ao iniciar o checkout.");
  return { clientSecret: session.client_secret, sessionId: session.id };
}

export async function confirmOrder(sessionId: string) {
  const user = await requireUser();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.metadata?.user_id !== user.id) {
    throw new Error("Sessão de pagamento inválida.");
  }
  if (session.payment_status !== "paid") {
    return { ok: false as const };
  }

  const product = getProduct(session.metadata.product_id ?? "");
  if (!product || !session.amount_total) {
    throw new Error("Pedido inválido.");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("orders").upsert(
    {
      user_id: user.id,
      product_id: product.id,
      product_name: product.name,
      amount_in_cents: session.amount_total,
      currency: session.currency ?? "brl",
      status: "paid",
      stripe_session_id: session.id,
    },
    { onConflict: "stripe_session_id", ignoreDuplicates: true },
  );

  if (error) {
    console.error("Failed to save order:", error.message);
    throw new Error("Pagamento aprovado, mas não foi possível salvar o pedido.");
  }

  return { ok: true as const };
}
