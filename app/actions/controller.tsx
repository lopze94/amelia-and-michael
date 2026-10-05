import { createController } from 'remix/router'

import { assets } from '../assets.ts'
import { routes } from '../routes.ts'
import { GiftsPage, HomePage, LocationPage } from './pages.tsx'

export default createController(routes, {
  actions: {
    async assets(context) {
      return (await assets.fetch(context.request)) ?? new Response('Not Found', { status: 404 })
    },
    home(context) {
      return context.render(<HomePage />)
    },
    location(context) {
      return context.render(<LocationPage />)
    },
    gifts(context) {
      return context.render(<GiftsPage />)
    },
  },
})
