import Link from "next/link";
import { notFound } from "next/navigation";
import { Checkout } from "@/components/checkout";
import { formatPrice, getProduct } from "@/lib/products";

export const metadata = { title: "Pagamento | APEXX" };

export default async function CheckoutPage({ params }: PageProps<"/checkout/[productId]">) {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <Link href="/#planos" className="text-sm text-muted hover:text-foreground">
          {"← Voltar aos planos"}
        </Link>
        <h1 className="text-3xl font-bold">Plano {product.name}</h1>
        <p className="text-muted">
          {formatPrice(product.priceInCents)} · pagamento único. Use o cartão de teste 4242 4242 4242 4242.
        </p>
      </div>
      <Checkout productId={product.id} />
    </div>
  );
}
