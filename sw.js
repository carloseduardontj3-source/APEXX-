// Service worker do APEXX. Mude VERSION a cada atualização do app para renovar o cache.
const VERSION = 'apexx-v5';
const SHELL = ['./app/', './app/index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.pathname.startsWith('/api/')) return;
  // Páginas: rede primeiro (pega atualização), cache se estiver offline
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./app/index.html'))));
    return;
  }
  // Arquivos do próprio app e fontes: cache primeiro
  if (u.origin === location.origin || FONT_HOSTS.includes(u.hostname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); }
      return res;
    })));
  }
  // Qualquer outro domínio (banco de dados, pagamento, APIs) passa direto pela rede, sem cache.
});
