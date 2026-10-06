// Cloudflare Turnstile. Set TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY in production. Outside
// production the keys default to Cloudflare's published always-pass test keys; in production
// without keys every check fails, so the details can never leak by misconfiguration.
const TEST_SITE_KEY = '1x00000000000000000000AA'
const TEST_SECRET_KEY = '1x0000000000000000000000000000000AA'
const production = process.env.NODE_ENV === 'production'

export const captchaSiteKey = process.env.TURNSTILE_SITE_KEY ?? (production ? '' : TEST_SITE_KEY)
const secretKey = process.env.TURNSTILE_SECRET_KEY ?? (production ? '' : TEST_SECRET_KEY)

export async function verifyCaptcha(token: string): Promise<boolean> {
  if (!token || !secretKey) return false
  try {
    let response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: secretKey, response: token }),
      signal: AbortSignal.timeout(5000),
    })
    let result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch (error) {
    console.error('Captcha verification failed', error)
    return false
  }
}
