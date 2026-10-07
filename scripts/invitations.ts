// Manage invitations.
//   node scripts/invitations.ts add "Amelia" "Michael" 2   (name 2 may be "" for one person)
//   node scripts/invitations.ts list
//   node scripts/invitations.ts import guests.csv [--replace]   (columns: name 1, name 2, guests)
//   node scripts/invitations.ts export                          (CSV with ids, for the shared sheet)
import { readFileSync } from 'node:fs'

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
} else if (command === 'import') {
  let file = args.find((a) => !a.startsWith('--'))
  let replace = args.includes('--replace')
  if (!file) {
    console.error('Usage: invitations.ts import <file.csv> [--replace]')
    process.exitCode = 1
  } else {
    // Rows without a first name (such as a spreadsheet totals row) are skipped.
    let rows = readFileSync(file, 'utf8')
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .slice(1)
      .map((line, i) => ({ line: i + 2, cells: line.split(',').map((cell) => cell.trim()) }))
      .filter(({ cells }) => cells[0])
    let errors = rows.flatMap(({ line, cells }) => {
      let count = Number(cells[2])
      return cells.length === 3 && Number.isInteger(count) && count > 0
        ? []
        : [`line ${line}: expected "name 1,name 2,guests", got "${cells.join(',')}"`]
    })
    let existing = await db.query(invitations).count()
    if (errors.length > 0) {
      console.error(errors.join('\n'))
      process.exitCode = 1
    } else if (existing > 0 && !replace) {
      console.error(`${existing} invitations already exist; pass --replace to wipe and re-import.`)
      process.exitCode = 1
    } else {
      await db.transaction(async (tx) => {
        await tx.query(invitations).delete()
        for (let { cells } of rows) {
          await tx.create(invitations, {
            id: createId(),
            name_1: cells[0],
            name_2: cells[1] || null,
            guests: Number(cells[2]),
          })
        }
      })
      console.error(`Imported ${rows.length} invitations.`)
    }
  }
} else if (command === 'export') {
  let rows = await db.query(invitations).orderBy('name_1').all()
  console.log('id,name_1,name_2,guests,link')
  for (let r of rows) console.log([r.id, r.name_1, r.name_2 ?? '', r.guests, link(r.id)].join(','))
} else if (command === 'list') {
  for (let row of await db.query(invitations).orderBy('name_1').all()) {
    let status =
      row.confirmed_guests === null ? 'pending' : `${row.confirmed_guests}/${row.guests}`
    console.log(`${status.padEnd(8)} ${[row.name_1, row.name_2].filter(Boolean).join(' y ')}  ${link(row.id)}`)
  }
} else {
  console.error('Usage: invitations.ts add|list|import|export')
  process.exitCode = 1
}

await db.close()
