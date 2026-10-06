// Cloudflare Turnstile. Set TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY in production. Outside
// production the keys default to Cloudflare's published always-pass test keys; in production
// without keys every check fails, so the details can never leak by misconfiguration.
const TEST_SITE_KEY = '1x00000000000000000000AA'
const TEST_SECRET_KEY = '1x0000000000000000000000000000000AA'
const production = process.env.NODE_ENV === 'production'

export const captchaSiteKey = process.env.TURNSTILE_SITE_KEY ?? (production ? '' : TEST_SITE_KEY)
const secretKey = process.env.TURNSTILE_SECRET_KEY ?? (production ? '' : TEST_SECRET_KEY)

// Names the widget on the gifts form; Cloudflare echoes it back so a token minted elsewhere
// can't be replayed here.
export const CAPTCHA_ACTION = 'gifts'

// Optional comma-separated list (e.g. "ameliaandmichael.com,www.ameliaandmichael.com"). When
// set, a token issued for any other hostname is rejected.
const allowedHostnames = (process.env.TURNSTILE_HOSTNAMES ?? '')
  .split(',')
  .map((hostname) => hostname.trim())
  .filter(Boolean)

export async function verifyCaptcha(token: string): Promise<boolean> {
  if (!token || !secretKey) return false
  try {
    let response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: secretKey, response: token }),
      signal: AbortSignal.timeout(5000),
    })
    let result = (await response.json()) as {
      success?: boolean
      action?: string
      hostname?: string
    }
    if (result.success !== true) return false
    // Cloudflare's test keys don't echo a real action or hostname, so only enforce these in production.
    if (production && result.action !== CAPTCHA_ACTION) return false
    if (allowedHostnames.length > 0 && !allowedHostnames.includes(result.hostname ?? '')) {
      return false
    }
    return true
  } catch (error) {
    console.error('Captcha verification failed', error)
    return false
  }
}
