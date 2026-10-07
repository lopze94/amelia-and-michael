import * as assert from 'remix/assert'
import { before, describe, it } from 'remix/test'

import { invitations } from './data/tables.ts'
import { db, migrateDatabase } from './db.ts'
import { router } from './router.ts'

const get = (path: string, cookie?: string) =>
  router.fetch(
    new Request(new URL(path, 'http://localhost'), { headers: cookie ? { Cookie: cookie } : {} }),
  )

const html = async (path: string, cookie?: string) => (await get(path, cookie)).text()

describe('i18n', () => {
  before(async () => {
    await migrateDatabase()
    await db.create(invitations, { id: 'i18n1', name_1: 'Ana', name_2: 'Luis', guests: 2 })
  })

  it('serves Spanish unprefixed and English under /en with translated paths', async () => {
    assert.match(await html('/'), /<html lang="es">/)
    assert.match(await html('/ubicacion'), /Código de acceso/)
    assert.match(await html('/regalos'), /Tu presencia es suficiente/)

    assert.match(await html('/en'), /<html lang="en">/)
    assert.match(await html('/en/location'), /Access code/)
    assert.match(await html('/en/gifts'), /Your presence is enough/)
  })

  it('does not serve the other language\'s path', async () => {
    assert.equal((await get('/en/ubicacion')).status === 200, false)
    assert.equal((await get('/location')).status === 200, false)
  })

  it('links between pages and languages stay in the visitor\'s language', async () => {
    let en = await html('/en/location')
    assert.match(en, /href="\/en\/gifts"/)
    assert.match(en, /href="\/ubicacion"[^>]*>Español/)

    let es = await html('/ubicacion')
    assert.match(es, /href="\/regalos"/)
    assert.match(es, /href="\/en\/location"[^>]*>English/)
  })

  it('keeps the language through the ?invite redirect and the rsvp flow', async () => {
    let redirect = await get('/en/gifts?invite=i18n1&x=1')
    assert.equal(redirect.status, 303)
    assert.equal(redirect.headers.get('Location'), '/en/gifts?x=1')
    let cookie = redirect.headers.get('Set-Cookie')!.split(';')[0]

    let page = await html('/en/rsvp', cookie)
    assert.match(page, /Confirm your attendance/)
    assert.match(page, /action="\/en\/rsvp"/)

    let invalid = await router.fetch(
      new Request('http://localhost/en/rsvp', {
        method: 'POST',
        body: new URLSearchParams({ guests: '9' }),
        headers: { Cookie: cookie },
      }),
    )
    assert.equal(invalid.status, 400)
    assert.match(await invalid.text(), /Choose an option\./)

    let ok = await router.fetch(
      new Request('http://localhost/en/rsvp', {
        method: 'POST',
        body: new URLSearchParams({ guests: '2' }),
        headers: { Cookie: cookie },
      }),
    )
    assert.equal(ok.status, 303)
    assert.equal(ok.headers.get('Location'), '/en/rsvp?gracias=1')
    assert.match(await html('/en/rsvp?gracias=1', cookie), /Thank you, Ana and Luis/)
  })

  it('does not leak the locale between concurrent requests', async () => {
    let pages = await Promise.all(
      Array.from({ length: 20 }, (_, i) => html(i % 2 ? '/en/gifts' : '/regalos')),
    )
    pages.forEach((page, i) =>
      assert.match(page, i % 2 ? /Your presence is enough/ : /Tu presencia es suficiente/),
    )
  })

  it('sends first-time English browsers to /en and then remembers the language', async () => {
    let nav = (path: string, headers: Record<string, string>) =>
      router.fetch(new Request(new URL(path, 'http://localhost'), { headers: { Accept: 'text/html', ...headers } }))

    let en = await nav('/regalos', { 'Accept-Language': 'en-US,en;q=0.9,es;q=0.8' })
    assert.equal(en.status, 302)
    assert.equal(en.headers.get('Location'), '/en/gifts')
    assert.match(en.headers.get('Set-Cookie')!, /lang=en/)

    assert.equal((await nav('/regalos', { 'Accept-Language': 'es-GT,es;q=0.9,en;q=0.8' })).status, 200)
    assert.equal((await nav('/regalos', { 'Accept-Language': 'fr' })).status, 200)
    // Once a language cookie exists the switch link back to Spanish is respected.
    assert.equal((await nav('/regalos', { 'Accept-Language': 'en', Cookie: 'lang=es' })).status, 200)
  })

  it('joins two names with "e" in Spanish when the second starts with i or y', async () => {
    await db.create(invitations, { id: 'i18n2', name_1: 'Ana', name_2: 'Irene', guests: 2 })
    let cookie = (await get('/regalos?invite=i18n2')).headers.get('Set-Cookie')!.split(';')[0]
    assert.match(await html('/confirmar?gracias=1', cookie), /Ana e Irene/)
    assert.match(await html('/en/rsvp?gracias=1', cookie), /Ana and Irene/)
  })
})
