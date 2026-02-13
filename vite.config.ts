import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: 'src',
    publicDir: '../public',
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt', 'sitemap.xml'],
            manifest: {
                name: 'LMS360 Hack',
                short_name: 'LMS360Hack',
                description: 'Công cụ tìm kiếm đáp án LMS360',
                theme_color: '#1565c0',
                icons: [
                    {
                        src: 'favicon.ico',
                        sizes: '64x64 32x32 24x24 16x16',
                        type: 'image/x-icon'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
            }
        })
    ],
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        reportCompressedSize: false,
        assetsInlineLimit: 15000,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
                advanced: resolve(__dirname, 'src/advanced.html'),
            },
        },
    },
});
