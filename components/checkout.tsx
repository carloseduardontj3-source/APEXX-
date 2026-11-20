"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { confirmOrder, startCheckoutSession } from "@/app/actions/checkout";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function Checkout({ productId }: { productId: string }) {
  const router = useRouter();
  const sessionIdRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    const { clientSecret, sessionId } = await startCheckoutSession(productId);
    sessionIdRef.current = sessionId;
    return clientSecret;
  }, [productId]);

  const handleComplete = useCallback(async () => {
    if (!sessionIdRef.current) return;
    try {
      await confirmOrder(sessionIdRef.current);
      router.push("/conta?sucesso=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao confirmar o pedido.");
    }
  }, [router]);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <div id="checkout" className="overflow-hidden rounded-xl bg-white">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret, onComplete: handleComplete }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
}
