import { fileURLToPath } from 'node:url'
import { loadMigrations } from 'remix/data-table/migrations/node'
import { createSqliteDatabase } from 'remix/data-table/sqlite'

const filename =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : (process.env.DATABASE_FILE ?? fileURLToPath(new URL('../db/wedding.sqlite', import.meta.url)))

export const db = createSqliteDatabase({ filename, foreignKeys: true })

export async function migrateDatabase() {
  let migrations = await loadMigrations(
    fileURLToPath(new URL('../db/migrations/', import.meta.url)),
  )
  await db.migrate(migrations)
}
