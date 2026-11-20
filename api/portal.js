// POST /api/portal  (Authorization: Bearer <token>)
// Abre o portal do Stripe: trocar cartao, ver faturas, cancelar assinatura.
const L = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.json(res, 405, { error: 'method_not_allowed' });
  try {
    const user = await L.authUser(req);
    if (!user) return L.json(res, 401, { error: 'login_required' });
    const sub = await L.getSubscription(user.id);
    if (!sub || !sub.provider_customer_id) return L.json(res, 404, { error: 'no_subscription' });
    const s = await L.stripe('POST', '/billing_portal/sessions', {
      customer: sub.provider_customer_id,
      return_url: L.appUrl(req) + '/app/',
    });
    return L.json(res, 200, { url: s.url });
  } catch (e) {
    console.error('portal', e.message);
    return L.json(res, 500, { error: 'portal_failed' });
  }
};
