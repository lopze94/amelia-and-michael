---
name: export-rsvps
description: Export the production wedding RSVP state (who confirmed, declined, or is pending, and guest counts) from the droplet to a CSV in ~/Downloads. Use when asked to export, download, or check RSVPs/confirmations/guest list status.
---

Read-only: never write to the production database.

1. Run the app's own export on the droplet, using a read of the live DB and the real site origin:

   ```sh
   ssh ameliaandmichael.com 'cd /home/deploy/amelia-and-michael && DATABASE_FILE=/var/lib/wedding/wedding.sqlite SITE_ORIGIN=https://ameliaandmichael.com node scripts/invitations.ts export' > ~/Downloads/rsvps-$(date +%F).csv
   ```

   If `node` on the droplet is not v24+, fall back to `sqlite3 -header -csv /var/lib/wedding/wedding.sqlite "select name_1, name_2, guests, confirmed_guests, confirmed_at from invitations order by confirmed_at is null, name_1"`.
   (Note the script runs migrations on open; they are no-ops when the DB is current.)

2. Check the file is non-empty, then report: path, invitations confirmed / declined / pending, total confirmed guests out of total invited guests (columns: `status`, `confirmed_guests`, `guests`).

3. Do not print the invite links or ids in the summary; they are in the CSV.
