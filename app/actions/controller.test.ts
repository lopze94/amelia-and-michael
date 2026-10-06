import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { router } from '../router.ts'
import { routes } from '../routes.ts'

describe('root controller', () => {
  it('GET / returns the home page', async () => {
    let response = await router.fetch(new URL(routes.home.href(), 'http://localhost'))

    assert.equal(response.status, 200)
    assert.match(response.headers.get('Content-Type') ?? '', /text\/html/)
    assert.match(await response.text(), /Amelia/)
  })

  it('serves every public page', async () => {
    for (let href of [routes.location.href(), routes.gifts.index.href()]) {
      let response = await router.fetch(new URL(href, 'http://localhost'))
      assert.equal(response.status, 200)
    }
  })
})
