import * as assert from 'remix/assert'
import { before, describe, it } from 'remix/test'

import { invitations } from '../../data/tables.ts'
import { db, migrateDatabase } from '../../db.ts'
import { router } from '../../router.ts'
import { routes } from '../../routes.ts'

const get = (path: string, cookie?: string) =>
  router.fetch(
    new Request(new URL(path, 'http://localhost'), { headers: cookie ? { Cookie: cookie } : {} }),
  )

const post = (body: Record<string, string>, cookie?: string) =>
  router.fetch(
    new Request(new URL(routes.rsvp.action.href(), 'http://localhost'), {
      method: 'POST',
      body: new URLSearchParams(body),
      headers: cookie ? { Cookie: cookie } : {},
    }),
  )

const cookieOf = (response: Response) => response.headers.get('Set-Cookie')?.split(';')[0]

describe('rsvp', () => {
  // Real cookie headers for each invitation, as the browser would send them back.
  let abc = ''
  let def = ''

  before(async () => {
    await migrateDatabase()
    await db.create(invitations, { id: 'abc123', name_1: 'Ana', name_2: 'Luis', guests: 2 })
    await db.create(invitations, { id: 'def456', name_1: 'Eva', name_2: null, guests: 1 })
    abc = cookieOf(await get('/?invite=abc123'))!
    def = cookieOf(await get('/?invite=def456'))!
  })

  it('404s without an invitation cookie', async () => {
    assert.equal((await get(routes.rsvp.index.href())).status, 404)
    assert.equal((await post({ guests: '1' })).status, 404)
  })

  it('stores a valid ?invite id in a cookie and strips it from the url', async () => {
    let response = await get('/ubicacion?invite=abc123&x=1')
    assert.equal(response.status, 303)
    assert.equal(response.headers.get('Location'), '/ubicacion?x=1')
    assert.equal(cookieOf(response), abc)
  })

  it('ignores an unknown ?invite id but still strips it', async () => {
    let response = await get('/?invite=bogus')
    assert.equal(response.headers.get('Location'), '/')
    assert.equal(response.headers.get('Set-Cookie'), null)
  })

  it('only overwrites the cookie with a different, valid id', async () => {
    let same = await get('/?invite=abc123', abc)
    assert.equal(same.headers.get('Set-Cookie'), null)

    let bogus = await get('/?invite=bogus', abc)
    assert.equal(bogus.headers.get('Set-Cookie'), null)

    let other = await get('/?invite=def456', abc)
    assert.equal(cookieOf(other), def)
  })

  it('shows the invitation and the nav link when the cookie is present', async () => {
    let response = await get(routes.rsvp.index.href(), abc)
    assert.equal(response.status, 200)
    assert.match(await response.text(), /Ana y Luis/)

    let home = await (await get('/', abc)).text()
    assert.match(home, /Confirmar/)
    assert.doesNotMatch(await (await get('/')).text(), /Confirmar/)
  })

  it('rejects a guest count outside the invitation', async () => {
    assert.equal((await post({ guests: '3' }, abc)).status, 400)
    assert.equal((await post({ guests: '' }, abc)).status, 400)
    assert.equal((await db.find(invitations, 'abc123'))?.confirmed_at, null)
  })

  it('records the confirmed guests and date', async () => {
    let response = await post({ guests: '1' }, abc)
    assert.equal(response.status, 303)

    let row = await db.find(invitations, 'abc123')
    assert.equal(row?.confirmed_guests, 1)
    assert.ok(row?.confirmed_at)
  })

  it('shows an earlier answer on the form for anyone opening the link', async () => {
    let before = await (await get(routes.rsvp.index.href(), def)).text()
    assert.doesNotMatch(before, /invitados confirmados/)

    await post({ guests: '1' }, def)
    let page = await (await get(routes.rsvp.index.href(), def)).text()
    assert.match(page, /<form/)
    assert.match(page, /1\/1 invitados confirmados el /)
  })
})
