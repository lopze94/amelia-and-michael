import * as assert from 'remix/assert'
import { afterEach, describe, it } from 'remix/test'

import { router } from '../../router.ts'
import { routes } from '../../routes.ts'

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

// Stands in for Cloudflare's siteverify endpoint.
const captchaSays = (success: boolean) => {
  globalThis.fetch = (async () => Response.json({ success })) as typeof fetch
}

const get = (search = '') =>
  router.fetch(new URL(routes.gifts.index.href() + search, 'http://localhost'))

const post = (body: Record<string, string>) =>
  router.fetch(
    new Request(new URL(routes.gifts.action.href(), 'http://localhost'), {
      method: 'POST',
      body: new URLSearchParams(body),
    }),
  )

describe('gifts', () => {
  it('asks for a country first, with no details in the page', async () => {
    let html = await (await get()).text()
    assert.match(html, /pais=uk/)
    assert.doesNotMatch(html, /Revolut|Zelle/)
  })

  it('shows the captcha for a chosen country, still without details', async () => {
    let response = await get('?pais=uk')
    assert.equal(response.status, 200)
    let html = await response.text()
    assert.match(html, /cf-turnstile/)
    assert.doesNotMatch(html, /Revolut/)
  })

  it('rejects a failed captcha and keeps the details hidden', async () => {
    captchaSays(false)
    let response = await post({ country: 'uk', 'cf-turnstile-response': 'bad' })
    assert.equal(response.status, 400)
    assert.doesNotMatch(await response.text(), /Revolut/)
  })

  it('rejects a missing token without asking Cloudflare', async () => {
    globalThis.fetch = (async () => {
      throw new Error('should not be called')
    }) as typeof fetch
    let response = await post({ country: 'uk' })
    assert.equal(response.status, 400)
  })

  it('shows the options for the country once the captcha passes', async () => {
    captchaSays(true)
    let response = await post({ country: 'uk', 'cf-turnstile-response': 'ok' })
    assert.equal(response.status, 200)
    let html = await response.text()
    assert.match(html, /Revolut/)
    assert.doesNotMatch(html, /Zelle/)
  })

  it('400s for an unknown country', async () => {
    captchaSays(true)
    assert.equal((await post({ country: 'xx', 'cf-turnstile-response': 'ok' })).status, 400)
  })
})
