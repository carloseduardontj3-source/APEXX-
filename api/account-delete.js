// POST /api/account-delete  (Authorization: Bearer <token>)
// Cancela a assinatura no Stripe e apaga o usuario. As tabelas apagam em cascata (FK ON DELETE CASCADE).
const L = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.json(res, 405, { error: 'method_not_allowed' });
  try {
    const user = await L.authUser(req);
    if (!user) return L.json(res, 401, { error: 'login_required' });

    // 1) nunca apaga a conta deixando cobranca ativa
    const sub = await L.getSubscription(user.id);
    if (sub && sub.provider_subscription_id) {
      const s = await L.stripe('GET', '/subscriptions/' + sub.provider_subscription_id);
      if (!['canceled', 'incomplete_expired'].includes(s.status)) await L.stripe('DELETE', '/subscriptions/' + s.id);
    }

    // 2) apaga o usuario no Supabase Auth
    const key = L.env('SUPABASE_SERVICE_ROLE_KEY');
    const r = await fetch(L.env('SUPABASE_URL') + '/auth/v1/admin/users/' + user.id, {
      method: 'DELETE', headers: { apikey: key, Authorization: 'Bearer ' + key },
    });
    if (!r.ok) throw new Error('auth delete ' + r.status);
    return L.json(res, 200, { deleted: true });
  } catch (e) {
    console.error('account-delete', e.message);
    return L.json(res, 500, { error: 'delete_failed' });
  }
};
