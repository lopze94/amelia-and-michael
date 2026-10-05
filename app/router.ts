import { createRouter, type MiddlewareContext } from 'remix/router'
import { formData } from 'remix/middleware/form-data'
import { render } from 'remix/middleware/render'
import { staticFiles } from 'remix/middleware/static'

import controller from './actions/controller.tsx'
import rsvpController from './actions/rsvp/controller.tsx'
import { assets } from './assets.ts'
import { routes } from './routes.ts'

const formDataMiddleware = formData()
const renderMiddleware = render({ assets })
type AppContext = MiddlewareContext<[typeof formDataMiddleware, typeof renderMiddleware]>

declare module 'remix' {
  interface RouterTypes {
    context: AppContext
  }
}

export const router = createRouter<AppContext>({
  middleware: [staticFiles('./public', { index: false }), formDataMiddleware, renderMiddleware],
})

router.map(routes, controller)
router.map(routes.rsvp, rsvpController)
