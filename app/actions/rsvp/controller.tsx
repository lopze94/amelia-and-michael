import { createController } from 'remix/router'
import { redirect } from 'remix/response/redirect'

import { db } from '../../db.ts'
import { invitations } from '../../data/tables.ts'
import { localizeHref, m } from '../../i18n.ts'
import { routes } from '../../routes.ts'
import { InviteNotFoundPage, RsvpPage } from '../pages.tsx'

// The invitation comes from the cookie set by loadInvitation(); without one there's no page.
export default createController(routes.rsvp, {
  actions: {
    index(context) {
      let invitation = context.invitation
      if (!invitation) return context.render(<InviteNotFoundPage />, { status: 404 })

      let thanks = new URL(context.request.url).searchParams.has('gracias')
      return context.render(<RsvpPage invitation={invitation} thanks={thanks} />)
    },
    async action(context) {
      let invitation = context.invitation
      if (!invitation) return context.render(<InviteNotFoundPage />, { status: 404 })

      let value = String(context.formData.get('guests') ?? '')
      let count = /^\d+$/.test(value) ? Number(value) : -1
      if (count < 0 || count > invitation.guests) {
        return context.render(
          <RsvpPage invitation={invitation} error={m.rsvp_error_choose()} />,
          { status: 400 },
        )
      }

      try {
        await db.update(invitations, invitation.id, {
          confirmed_guests: count,
          confirmed_at: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Failed to save RSVP', error)
        return context.render(
          <RsvpPage
            invitation={invitation}
            error={m.rsvp_error_save()}
          />,
          { status: 500 },
        )
      }

      return redirect(
        localizeHref(routes.rsvp.index.href(null, { searchParams: { gracias: '1' } })),
        303,
      )
    },
  },
})
