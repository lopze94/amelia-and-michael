// Manage invitations.
//   node scripts/invitations.ts add "Amelia" "Michael" 2   (name 2 may be "" for one person)
//   node scripts/invitations.ts list
import { createId } from '@paralleldrive/cuid2'

import { invitations } from '../app/data/tables.ts'
import { db, migrateDatabase } from '../app/db.ts'

const origin = process.env.SITE_ORIGIN ?? 'http://localhost:44100'
const link = (id: string) => `${origin}/?invite=${id}`

await migrateDatabase()

let [command, ...args] = process.argv.slice(2)

if (command === 'add') {
  let [name1, name2, guests] = args
  let count = Number(guests)
  if (!name1 || !Number.isInteger(count) || count < 1) {
    console.error('Usage: invitations.ts add <name1> <name2 or ""> <guests>')
    process.exitCode = 1
  } else {
    let id = createId()
    await db.create(invitations, { id, name_1: name1, name_2: name2 || null, guests: count })
    console.log(link(id))
  }
} else if (command === 'list') {
  for (let row of await db.query(invitations).orderBy('name_1').all()) {
    let status =
      row.confirmed_guests === null ? 'pending' : `${row.confirmed_guests}/${row.guests}`
    console.log(`${status.padEnd(8)} ${[row.name_1, row.name_2].filter(Boolean).join(' y ')}  ${link(row.id)}`)
  }
} else {
  console.error('Usage: invitations.ts add|list')
  process.exitCode = 1
}

await db.close()
