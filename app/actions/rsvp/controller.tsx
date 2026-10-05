import { createController } from 'remix/router'
import { redirect } from 'remix/response/redirect'

import { saveRsvp } from '../../data/rsvps.ts'
import { routes } from '../../routes.ts'
import { RsvpPage } from '../pages.tsx'

export default createController(routes.rsvp, {
  actions: {
    index(context) {
      let url = new URL(context.request.url)
      let name = url.searchParams.get('nombre')
      let attend = url.searchParams.get('asistencia')
      if (name && (attend === 'yes' || attend === 'no')) {
        return context.render(<RsvpPage sent={{ name, attend }} />)
      }
      return context.render(<RsvpPage />)
    },
    async action(context) {
      let form = context.formData
      let name = String(form.get('name') ?? '').trim().slice(0, 200)
      let attend = String(form.get('attend') ?? '')

      if (!name || (attend !== 'yes' && attend !== 'no')) {
        return context.render(
          <RsvpPage
            error="Escribe tu nombre y elige una opción."
            values={{ name, attend }}
          />,
          { status: 400 },
        )
      }

      try {
        await saveRsvp({ name, attend, timestamp: new Date().toISOString() })
      } catch (error) {
        console.error('Failed to save RSVP', error)
        return context.render(
          <RsvpPage
            error="No pudimos guardar tu respuesta. Inténtalo de nuevo."
            values={{ name, attend }}
          />,
          { status: 500 },
        )
      }

      let next = new URL(routes.rsvp.index.href(), 'http://localhost')
      next.searchParams.set('nombre', name)
      next.searchParams.set('asistencia', attend)
      return redirect(next.pathname + next.search, 303)
    },
  },
})
