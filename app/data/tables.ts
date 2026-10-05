import { column as c, table } from 'remix/data-table'
import type { TableRow } from 'remix/data-table'

// `id` is a cuid and doubles as the secret in the invite URL. A null confirmed_at means the
// invitation hasn't been answered; confirmed_guests = 0 means they declined.
export const invitations = table({
  name: 'invitations',
  columns: {
    id: c.text(),
    name_1: c.text(),
    name_2: c.text().nullable(),
    guests: c.integer(),
    confirmed_guests: c.integer().nullable(),
    confirmed_at: c.text().nullable(),
  },
})

export type Invitation = TableRow<typeof invitations>
