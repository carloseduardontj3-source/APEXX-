// POST /api/stripe-webhook  (chamado pelo Stripe, nao pelo app)
// Unica porta de escrita em subscriptions e payments.
const L = require('./_lib');

const PREMIUM = ['active', 'trialing'];

async function userFromCustomer(customerId) {
  if (!customerId) return null;
  const rows = await L.db('GET', `/subscriptions?provider_customer_id=eq.${encodeURIComponent(customerId)}&select=user_id`);
  return rows && rows[0] ? rows[0].user_id : null;
}

// Sempre busca a assinatura atual no Stripe: evita erro por eventos fora de ordem.
async function syncSubscription(subId, fallbackUserId) {
  const sub = await L.stripe('GET', '/subscriptions/' + subId);
  const userId = (sub.metadata && sub.metadata.supabase_user_id) || fallbackUserId || (await userFromCustomer(sub.customer));
  if (!userId) throw new Error('Usuario nao encontrado para a assinatura ' + subId);
  const end = sub.current_period_end || (sub.items && sub.items.data[0] && sub.items.data[0].current_period_end);
  await L.db('POST', '/subscriptions?on_conflict=user_id', {
    user_id: userId,
    plan: PREMIUM.includes(sub.status) ? 'premium' : 'free',
    status: sub.status,
    provider: 'stripe',
    provider_customer_id: sub.customer,
    provider_subscription_id: sub.id,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    current_period_end: end ? new Date(end * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }, 'resolution=merge-duplicates,return=minimal');
  return userId;
}

async function recordInvoice(inv) {
  const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription && inv.subscription.id;
  let userId = null;
  if (subId) userId = await syncSubscription(subId);
  else userId = await userFromCustomer(inv.customer);
  if (!userId) throw new Error('Usuario nao encontrado para a fatura ' + inv.id);
  await L.db('POST', '/payments?on_conflict=provider,provider_ref', {
    user_id: userId,
    provider: 'stripe',
    provider_ref: inv.id,
    amount_cents: inv.amount_paid,
    currency: String(inv.currency || '').toUpperCase(),
    status: 'paid',
  }, 'resolution=ignore-duplicates,return=minimal');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.json(res, 405, { error: 'method_not_allowed' });
  let raw;
  try {
    raw = await L.readRaw(req); // corpo cru: necessario para validar a assinatura
    if (!L.verifyStripeSignature(raw, req.headers['stripe-signature'], L.env('STRIPE_WEBHOOK_SECRET'))) {
      return L.json(res, 400, { error: 'bad_signature' });
    }
    const event = JSON.parse(raw.toString('utf8'));
    const o = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed':
        if (o.mode === 'subscription' && o.subscription) await syncSubscription(o.subscription, o.client_reference_id);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(o.id);
        break;
      case 'invoice.paid':
        await recordInvoice(o);
        break;
      default:
        break; // eventos que nao usamos: responde 200 para o Stripe nao reenviar
    }
    return L.json(res, 200, { received: true });
  } catch (e) {
    console.error('webhook', e.message);
    return L.json(res, 500, { error: 'webhook_failed' }); // 500 faz o Stripe tentar de novo
  }
};
