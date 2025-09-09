import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path, { resolve } from 'path'
import fs from 'fs'

export default defineConfig({
    plugins: [
        vue(),
        {
            name: 'copy-and-inject-html',
            apply: 'build',
            closeBundle() {
                const htmlPath = path.resolve(__dirname, 'public/index.html')
                const destPath = path.resolve(__dirname, 'dist/index.html')
                let html = fs.readFileSync(htmlPath, 'utf-8')
                if (!html.includes('src="app.js"')) {
                    html = html.replace(/<\/body>/i, '  <script src="app.js"></script>\n</body>')
                }
                // Ensure dist/ directory exists before writing the file
                fs.mkdirSync(path.dirname(destPath), { recursive: true })
                console.log('Injecting app.js into dist/index.html')
                fs.writeFileSync(destPath, html, 'utf-8')
            }
        }
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(__dirname, 'src/main.js'),
            output: {
                entryFileNames: 'app.js'
            }
        }
    }
})
