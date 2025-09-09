
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path, { resolve } from 'path'
import fs from 'fs'

function servePublicIndexWithHMR() {
  return {
    name: 'serve-public-index-with-hmr',
    apply: 'serve',
    configureServer(server) {
      // Map /app.js -> /src/main.js in dev just in case the HTML still references it
      server.middlewares.use((req, res, next) => {
        if (req.url === '/app.js') {
          res.setHeader('Content-Type', 'application/javascript')
          res.end("import '/src/main.js'\n")
          return
        }
        next()
      })

      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '/'
        const wantsRoot = url === '/' || url === '/index.html'
        const wantsPublic = url === '/public' || url === '/public/' || url === '/public/index.html'
        if (!wantsRoot && !wantsPublic) return next()

        const htmlPath = path.resolve(__dirname, 'public/index.html')
        try {
          let html = fs.readFileSync(htmlPath, 'utf-8')

          // Remove any non-module production script to app.js to prevent 404s in dev
          html = html.replace(/<script[^>]*src=["']\/?app\.js["'][^>]*><\/script>/gi, '')

          // Ensure a module entry exists for dev
          if (!/type="module"[^>]*src="\/src\/main\.js"/i.test(html)) {
            html = html.replace(/<\/body>/i, '\n  <script type="module" src="/src/main.js"></script>\n</body>')
          }

          const transformed = await server.transformIndexHtml('/index.html', html)
          res.setHeader('Content-Type', 'text/html')
          res.end(transformed)
          return
        } catch (e) {
          return next(e)
        }
      })
    },
  }
}

function copyAndInjectOnBuild() {
  return {
    name: 'copy-and-inject-html',
    apply: 'build',
    closeBundle() {
      const htmlPath = path.resolve(__dirname, 'public/index.html')
      const destPath = path.resolve(__dirname, 'dist/index.html')
      let html = fs.readFileSync(htmlPath, 'utf-8')
      if (!html.includes('src="app.js"')) {
        html = html.replace(/<\/body>/i, '  <script src="app.js"></script>\n</body>')
      }
      fs.mkdirSync(path.dirname(destPath), { recursive: true })
      console.log('Injecting app.js into dist/index.html')
      fs.writeFileSync(destPath, html, 'utf-8')
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    servePublicIndexWithHMR(),
    copyAndInjectOnBuild(),
  ],
  server: {
    open: '/public/index.html', // Will be served as transformed /index.html
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/main.js'),
      output: {
        entryFileNames: 'app.js',
      },
    },
  },
})
