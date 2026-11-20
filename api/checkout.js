// POST /api/checkout  (Authorization: Bearer <token do usuario>)
// Cria uma sessao de pagamento do Stripe e devolve { url }.
const L = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.json(res, 405, { error: 'method_not_allowed' });
  try {
    const user = await L.authUser(req);
    if (!user) return L.json(res, 401, { error: 'login_required' });

    const sub = await L.getSubscription(user.id);
    if (sub && sub.plan === 'premium' && ['active', 'trialing'].includes(sub.status)) {
      return L.json(res, 409, { error: 'already_premium' });
    }

    // Brasil paga em reais; o resto do mundo em dolar. O pais vem da Vercel, nao do navegador.
    const country = String(req.headers['x-vercel-ip-country'] || '').toUpperCase();
    const price = country === 'BR' ? L.env('STRIPE_PRICE_BRL') : L.env('STRIPE_PRICE_USD');
    const base = L.appUrl(req);

    const params = {
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: base + '/app/?checkout=success',
      cancel_url: base + '/app/?checkout=cancel',
      client_reference_id: user.id,
      allow_promotion_codes: 'true',
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
    };
    if (sub && sub.provider_customer_id) params.customer = sub.provider_customer_id;
    else if (user.email) params.customer_email = user.email;

    const session = await L.stripe('POST', '/checkout/sessions', params);
    return L.json(res, 200, { url: session.url });
  } catch (e) {
    console.error('checkout', e.message);
    return L.json(res, 500, { error: 'checkout_failed' });
  }
};
