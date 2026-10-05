import { defineConfig } from '@inlang/paraglide-js'

// The router only ever sees the Spanish (base locale) paths in app/routes.ts: the middleware in
// app/i18n.ts turns `/en/location` back into `/ubicacion` before routing. Add a line here when a
// route is added to routes.ts. Spanish stays unprefixed so existing links keep working.
const translated = [
  ['/', '/en'],
  ['/ubicacion', '/en/location'],
  ['/confirmar', '/en/rsvp'],
  ['/regalos', '/en/gifts'],
]

export default defineConfig({
  outdir: './app/paraglide',
  strategy: ['url', 'baseLocale'],
  trailingSlash: 'never',
  urlPatterns: translated.map(([es, en]) => ({
    pattern: es,
    localized: [
      ['es', es],
      ['en', en],
    ],
  })),
})
