// In-memory fixed-window limiter. Fine for a single-process server; the counts reset on restart.
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  let hits = new Map<string, { count: number; resetAt: number }>()

  return {
    // Returns 0 when the request is allowed, otherwise the seconds until the key may try again.
    check(key: string, now = Date.now()): number {
      for (let [k, entry] of hits) if (entry.resetAt <= now) hits.delete(k)

      let entry = hits.get(key)
      if (!entry) {
        hits.set(key, { count: 1, resetAt: now + windowMs })
        return 0
      }
      if (entry.count >= limit) return Math.ceil((entry.resetAt - now) / 1000)
      entry.count++
      return 0
    },
  }
}
