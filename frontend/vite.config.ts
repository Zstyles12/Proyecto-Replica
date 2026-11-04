import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// La lista de archivos del build, para que el Service Worker (public/sw.js) los guarde y la web abra
// sin conexión (RNF-13). Los mapas de código no van.
function precache(): Plugin {
  return {
    name: 'replica-precache',
    apply: 'build',
    generateBundle(_, bundle) {
      const files = Object.keys(bundle).filter((f) => /\.(js|css|woff2)$/.test(f))
      this.emitFile({ type: 'asset', fileName: 'precache.json', source: JSON.stringify(files) })
    },
  }
}

// La imagen del enlace compartido necesita una dirección completa. Vercel da la de producción al
// construir (VERCEL_PROJECT_PRODUCTION_URL); en local queda la ruta relativa.
function siteUrl(): Plugin {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const url = host ? `https://${host}` : ''
  return {
    name: 'replica-site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url),
  }
}

// npm run preview sirve las mismas cabeceras que Vercel (vercel.json): así la CSP se prueba antes de publicar.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[]
}
const securityHeaders = Object.fromEntries(
  (vercel.headers.find((h) => h.source === '/(.*)')?.headers ?? []).map((h) => [h.key, h.value])
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), precache(), siteUrl()],
  preview: { headers: securityHeaders },
})
