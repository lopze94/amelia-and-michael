#!/bin/sh
# Nightly SQLite backup, keeping the last 14 days. Run from cron as the deploy user.
set -eu

DB=/var/lib/wedding/wedding.sqlite
DEST=/var/backups/wedding

mkdir -p "$DEST"
sqlite3 "$DB" ".backup '$DEST/wedding-$(date +%F).sqlite'"
find "$DEST" -name 'wedding-*.sqlite' -mtime +14 -delete
