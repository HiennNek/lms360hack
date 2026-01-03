// ./sw.js
const filesMap = new Map();

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data.type === 'SET_H5P_DATA') {
        filesMap.clear();
        for (const [path, data] of Object.entries(event.data.files)) {
            filesMap.set(path, data);
        }
        event.ports[0].postMessage({ status: 'ok' });
    }
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/h5p-preview/')) {
        const path = url.pathname.replace('/h5p-preview/', '');
        if (filesMap.has(path)) {
            const data = filesMap.get(path);
            const mimeType = getMimeType(path);
            event.respondWith(new Response(data, {
                headers: { 'Content-Type': mimeType }
            }));
        } else {
            event.respondWith(new Response('Not Found', { status: 404 }));
        }
    }
});

function getMimeType(path) {
    const ext = path.split('.').pop().toLowerCase();
    const types = {
        'json': 'application/json',
        'js': 'application/javascript',
        'css': 'text/css',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'mp4': 'video/mp4',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'ttf': 'font/ttf',
        'otf': 'font/otf',
        'html': 'text/html'
    };
    return types[ext] || 'application/octet-stream';
}
