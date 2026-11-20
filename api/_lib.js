// Funcoes compartilhadas. O prefixo "_" impede que a Vercel exponha este arquivo como endpoint.
const crypto = require('crypto');

const env = (k) => {
  const v = process.env[k];
  if (!v) throw new Error('Variavel de ambiente ausente: ' + k);
  return v;
};

const json = (res, code, body) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const readRaw = (req) => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => resolve(Buffer.concat(chunks)));
  req.on('error', reject);
});

// Stripe espera application/x-www-form-urlencoded com chaves aninhadas: a[b][0]=c
const form = (obj, prefix, out = []) => {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') form(v, key, out);
    else out.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(v)));
  }
  return out;
};

const stripe = async (method, path, params) => {
  const r = await fetch('https://api.stripe.com/v1' + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + env('STRIPE_SECRET_KEY'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2024-06-20',
    },
    body: params ? form(params).join('&') : undefined,
  });
  const data = await r.json();
  if (!r.ok) {
    const e = new Error((data.error && data.error.message) || 'Erro no Stripe');
    e.status = r.status;
    throw e;
  }
  return data;
};

// Escrita com service_role (ignora RLS). So roda no servidor.
const db = async (method, path, body, prefer) => {
  const base = env('SUPABASE_URL') + '/rest/v1';
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const r = await fetch(base + path, {
    method,
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error('Supabase ' + r.status + ': ' + (await r.text()).slice(0, 200));
  const t = await r.text();
  return t ? JSON.parse(t) : null;
};

// Valida o token do usuario logado no app e devolve { id, email }.
const authUser = async (req) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return null;
  const r = await fetch(env('SUPABASE_URL') + '/auth/v1/user', {
    headers: { apikey: env('SUPABASE_ANON_KEY'), Authorization: 'Bearer ' + token },
  });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.id ? { id: u.id, email: u.email } : null;
};

const appUrl = (req) => (process.env.APP_URL || 'https://' + req.headers.host).replace(/\/$/, '');

const getSubscription = async (userId) => {
  const rows = await db('GET', `/subscriptions?user_id=eq.${userId}&select=*`);
  return rows && rows[0] ? rows[0] : null;
};

const verifyStripeSignature = (raw, header, secret, tolerance = 300) => {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const t = parts.t, v1 = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  if (!t || !v1.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > tolerance) return false;
  const expected = crypto.createHmac('sha256', secret).update(t + '.' + raw.toString('utf8')).digest('hex');
  return v1.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
};

module.exports = { env, json, readRaw, stripe, db, authUser, appUrl, getSubscription, verifyStripeSignature };
