import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { createRateLimiter } from './rate-limit.ts'

describe('rate limiter', () => {
  it('blocks after the limit and recovers after the window', () => {
    let limiter = createRateLimiter({ limit: 2, windowMs: 1000 })
    assert.equal(limiter.check('a', 0), 0)
    assert.equal(limiter.check('a', 100), 0)
    assert.equal(limiter.check('a', 200), 1)
    assert.equal(limiter.check('b', 200), 0)
    assert.equal(limiter.check('a', 1000), 0)
  })
})
