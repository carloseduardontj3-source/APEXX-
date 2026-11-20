import Link from "next/link";
import { formatPrice, PRODUCTS } from "@/lib/products";

export function PricingCards() {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {PRODUCTS.map((product) => (
        <li
          key={product.id}
          className={`flex flex-col gap-6 rounded-xl border p-6 ${
            product.highlighted ? "border-accent bg-surface" : "border-border"
          }`}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              {product.highlighted && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  Mais popular
                </span>
              )}
            </div>
            <p className="text-sm text-muted">{product.description}</p>
          </div>
          <p className="text-3xl font-bold">
            {formatPrice(product.priceInCents)}
            <span className="ml-1 text-sm font-normal text-muted">pagamento único</span>
          </p>
          <ul className="flex flex-1 flex-col gap-2 text-sm">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href={`/checkout/${product.id}`}
            className={`rounded-md px-4 py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-90 ${
              product.highlighted
                ? "bg-accent text-accent-foreground"
                : "border border-border hover:bg-surface"
            }`}
          >
            Assinar {product.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
