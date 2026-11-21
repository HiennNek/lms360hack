// Fuck sw
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        await self.registration.unregister();
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        const clients = await self.clients.matchAll({ type: 'window' });
        await Promise.all(clients.map((client) => {
            try {
                return client.navigate(client.url);
            } catch {
                return Promise.resolve();
            }
        }));
    })());
});
