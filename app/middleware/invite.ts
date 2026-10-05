import { createCookie } from 'remix/cookie'
import { createContextKey } from 'remix/router'
import type { Middleware } from 'remix/router'

import { invitations } from '../data/tables.ts'
import type { Invitation } from '../data/tables.ts'
import { db } from '../db.ts'
import { localizeHref } from '../i18n.ts'

export const inviteContext = createContextKey<Invitation | null>()

// Unsigned on purpose: the id is checked against the database on every request, so a forged
// value is just an unknown invitation.
const inviteCookie = createCookie('invite', {
  httpOnly: true,
  sameSite: 'Lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
})

// `?invite=<id>` on any page links the browser to that invitation: a valid id is stored in a
// cookie (replacing a different one) and the param is stripped with a redirect. Every other
// request resolves the invitation from the cookie and exposes it as `context.invitation`.
export function loadInvitation(): Middleware<{
  key: typeof inviteContext
  value: Invitation | null
  property: 'invitation'
}> {
  return async (context, next) => {
    let url = new URL(context.request.url)
    let method = context.request.method
    let cookieId = await inviteCookie.parse(context.request.headers.get('Cookie'))

    if (url.searchParams.has('invite') && (method === 'GET' || method === 'HEAD')) {
      let id = url.searchParams.get('invite') ?? ''
      url.searchParams.delete('invite')
      let headers = new Headers({ Location: localizeHref(url.pathname + url.search) })
      if (id && id !== cookieId && (await db.find(invitations, id))) {
        headers.set('Set-Cookie', await inviteCookie.serialize(id))
      }
      return new Response(null, { status: 303, headers })
    }

    let invitation = cookieId && !url.pathname.startsWith('/assets/')
      ? await db.find(invitations, cookieId)
      : null
    context.set(inviteContext, invitation, { property: 'invitation' })
    return next()
  }
}
