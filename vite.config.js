import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    publicDir: false,
    root: '.',
    plugins: [
        vue(),

        // Inject src/main.js in dev
        {
            name: 'sta-inject-entry-dev',
            apply: 'serve',
            transformIndexHtml() {
                return [
                    {
                        tag: 'script',
                        attrs: { type: 'module', src: '/@vite/client' },
                        injectTo: 'head'
                    },
                    {
                        tag: 'script',
                        attrs: { type: 'module', src: '/src/main.js' },
                        injectTo: 'head'
                    }
                ]
            }
        },

        // Inject app.js in build
        {
            name: 'sta-inject-entry-build',
            apply: 'build',
            transformIndexHtml(html) {
                if (html.includes('src="./app.js"')) return html
                return html.replace(
                    /<\/head>/i,
                    '    <script src="./app.js"></script>\n  </head>'
                )
            }
        }
    ],

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },

    server: {
        open: '/index.html',
        fs: { strict: false }
    },

    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: 'public/index.html',
            output: {
                entryFileNames: 'app.js',
                chunkFileNames: 'app.js',
                assetFileNames: '[name][extname]'
            }
        }
    }
})
