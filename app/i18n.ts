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
  return (input, init) =>
    paraglideMiddleware(new Request(input, init), ({ request }) => handle(request))
}

const DATE_LOCALES = { es: 'es-GT', en: 'en-GB' } as const

export const formatDate = (date: Date) => date.toLocaleDateString(DATE_LOCALES[getLocale()])
