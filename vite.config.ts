import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: 'src',
    publicDir: '../public',
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
