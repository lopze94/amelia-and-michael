import * as http from 'node:http'
import { createRequestListener, type FetchHandler } from 'remix/node-fetch-server'

import { db, migrateDatabase } from './app/db.ts'
import { createRateLimiter } from './app/rate-limit.ts'
import { router } from './app/router.ts'

await migrateDatabase()

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 44100
const hmrProxyPort = process.env.HMR_PROXY_PORT
  ? Number.parseInt(process.env.HMR_PROXY_PORT, 10)
  : null
const isHmr = process.env.REMIX_NODE_HMR === '1'
// Set TRUST_PROXY=1 when running behind nginx/Caddy so the limiter sees real client IPs.
const trustProxy = isHmr || process.env.TRUST_PROXY === '1'

// Form submissions (any non-GET request): 10 per minute per IP.
const formLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 })

const server = http.createServer(
  createRequestListener(
    ((request, client) => {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        let retryAfter = formLimiter.check(client.address)
        if (retryAfter > 0) {
          return new Response('Too many requests. Please try again in a moment.', {
            status: 429,
            headers: { 'Retry-After': String(retryAfter), 'Content-Type': 'text/plain' },
          })
        }
      }
      return router.fetch(request)
    }) satisfies FetchHandler,
    { trustProxy },
  ),
)

server.listen(port, () => {
  if (isHmr) {
    import('remix/node-hmr/runtime').then((nodeHmr) => nodeHmr.emitServerReady())
  }

  console.log(`Server listening on http://localhost:${hmrProxyPort ?? port}`)
})

let shuttingDown = false

function shutdown() {
  if (shuttingDown) {
    return
  }

  shuttingDown = true
  server.close(() => db.close().finally(() => process.exit(0)))
  server.closeAllConnections()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
