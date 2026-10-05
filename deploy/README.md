# Deploying to the droplet

Files here are meant to be copied onto a fresh Ubuntu droplet. Paths assume a `deploy` user
and the repo cloned at `/home/deploy/amelia-and-michael`.

## One-time setup (as root)

```sh
# Swap, so npm/sass don't run out of memory on 512 MB
fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Deploy user (copy your SSH key over so you can log in as it)
adduser --disabled-password --gecos '' deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Node 24 (system-wide, so /usr/bin/npm exists), sqlite3, firewall
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs sqlite3
ufw allow 22,80,443/tcp && ufw enable

# Caddy: install from https://caddyserver.com/docs/install#debian-ubuntu-raspbian

# Database directory, outside the repo so a re-clone never touches it
mkdir -p /var/lib/wedding && chown deploy:deploy /var/lib/wedding
```

## App (as deploy)

```sh
git clone <repo-url> amelia-and-michael && cd amelia-and-michael
npm ci
```

## Services (as root)

```sh
cp deploy/wedding.service /etc/systemd/system/
cp deploy/Caddyfile /etc/caddy/Caddyfile
systemctl daemon-reload
systemctl enable --now wedding
systemctl reload caddy
```

## Backups (as deploy)

`crontab -e`, then add:

```
0 3 * * * /home/deploy/amelia-and-michael/deploy/backup.sh
```

Copy `/var/backups/wedding` off the droplet now and then, or enable DigitalOcean backups.

## Updating

```sh
cd ~/amelia-and-michael && git pull && npm ci && sudo systemctl restart wedding
```

(`deploy` needs sudo for that last step, or run it as root.) Logs: `journalctl -u wedding -f`.
