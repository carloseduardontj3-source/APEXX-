export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  features: string[];
  highlighted?: boolean;
}

// Source of truth for prices. Checkout only receives a product id and the
// server looks up the price here, so the client cannot tamper with it.
export const PRODUCTS: Product[] = [
  {
    id: "start",
    name: "Start",
    description: "Para quem está começando.",
    priceInCents: 4900,
    features: ["Acesso à plataforma", "Suporte por e-mail", "1 usuário"],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para quem quer ir mais longe.",
    priceInCents: 14900,
    features: [
      "Tudo do Start",
      "Suporte prioritário",
      "Até 5 usuários",
      "Relatórios avançados",
    ],
    highlighted: true,
  },
  {
    id: "elite",
    name: "Elite",
    description: "Para equipes de alta performance.",
    priceInCents: 39900,
    features: [
      "Tudo do Pro",
      "Usuários ilimitados",
      "Gerente de conta dedicado",
    ],
  },
];

export function getProduct(id: string) {
  return PRODUCTS.find((product) => product.id === id);
}

export function formatPrice(cents: number, currency = "brl") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
