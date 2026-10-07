import { paraglideMiddleware } from './paraglide/server.js'
import { getLocale, localizeHref } from './paraglide/runtime.js'

export { m } from './paraglide/messages.js'
export { getLocale, localizeHref }
export { locales } from './paraglide/runtime.js'
export type { Locale } from './paraglide/runtime.js'

// Routes are defined once, in Spanish, in routes.ts. The middleware reads the locale from the
// URL (`/en/location`), then hands the router the Spanish path (`/ubicacion`). Anything that
// leaves the router - links, form actions, redirects - goes through localizeHref() to get back
// to the visitor's language. The mapping lives in project.inlang/paraglide.config.ts.
export function withLocale(
  handle: (request: Request) => Response | Promise<Response>,
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  return async (input, init) => {
    let request = new Request(input, init)
    let first = detectLocale(request)
    if (first) {
      let url = new URL(request.url)
      let target = localizeHref(url.pathname + url.search, { locale: first })
      return new Response(null, {
        status: 302,
        headers: { Location: target, 'Set-Cookie': LANG_COOKIE(first), Vary: 'Accept-Language' },
      })
    }
    let response = await paraglideMiddleware(request, ({ request }) => handle(request))
    if (response.headers.get('Content-Type')?.includes('text/html') && !hasLangCookie(request)) {
      let locale = new URL(request.url).pathname.startsWith('/en') ? 'en' : 'es'
      response = new Response(response.body, response)
      response.headers.append('Set-Cookie', LANG_COOKIE(locale))
    }
    return response
  }
}

const LANG_COOKIE = (locale: string) => `lang=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`
const hasLangCookie = (request: Request) => /(?:^|;\s*)lang=/.test(request.headers.get('Cookie') ?? '')

// First visit only (no `lang` cookie yet): a browser that prefers English over Spanish and lands
// on a Spanish URL is sent to the English page. After that the cookie wins, so the language
// switch link keeps working both ways.
function detectLocale(request: Request): 'en' | undefined {
  if (request.method !== 'GET' || hasLangCookie(request)) return undefined
  if (!request.headers.get('Accept')?.includes('text/html')) return undefined
  if (new URL(request.url).pathname.startsWith('/en')) return undefined
  for (let part of (request.headers.get('Accept-Language') ?? '').split(',')) {
    let tag = part.split(';')[0].trim().toLowerCase()
    if (tag.startsWith('en')) return 'en'
    if (tag.startsWith('es')) return undefined
  }
  return undefined
}

const DATE_LOCALES = { es: 'es-GT', en: 'en-GB' } as const

export const formatDate = (date: Date) => date.toLocaleDateString(DATE_LOCALES[getLocale()])
