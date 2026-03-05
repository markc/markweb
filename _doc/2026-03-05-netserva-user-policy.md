# NetServa User & Vhost Policy

Standard for all mesh nodes and NetServa servers. Defines user accounts, UID/GID allocation, home directories, and vhost directory structure.

## Principles

1. **sysadm is always UID 1000:1000** — the first non-system user on every node
2. **Sequential UIDs** — additional vhost users are u1001:1001, u1002:1002, etc.
3. **Desktop exception** — workstations use real names (markc, annie) at UID 1001+ instead of uNNNN
4. **Homes under /srv/** — every user's home is `/srv/{fqdn}/` where fqdn is the vhost they own
5. **Primary FQDN** — sysadm always owns the primary domain (typically `mail.{domain}`)
6. **One user per vhost** — each web application gets its own UID for process isolation

## User Allocation

| UID:GID | Name | Role | Home |
|---------|------|------|------|
| 1000:1000 | sysadm | Primary admin, owns mail/primary vhost | `/srv/mail.{domain}/` |
| 1001:1001 | u1001 (or real name) | First additional vhost | `/srv/{fqdn}/` |
| 1002:1002 | u1002 (or real name) | Second additional vhost | `/srv/{fqdn}/` |
| ... | ... | ... | ... |

**Desktop workstations:** UID 1001 is the interactive login user (e.g. `markc`). Their home may be `/home/{name}` rather than `/srv/`, but any vhosts they own still follow the `/srv/{fqdn}/` structure.

## Vhost Directory Structure

Every vhost home contains a standard tree:

```
/srv/{fqdn}/
├── msg/                  # Stalwart mail data (if mail-enabled)
│   └── admin/            # Stalwart admin UI / config
├── web/                  # Web application root
│   └── app/              # Laravel/framework application
│       └── public/       # Document root (FrankenPHP serves this)
```

- **FrankenPHP document root:** `/srv/{fqdn}/web/app/public/`
- **Laravel base path:** `/srv/{fqdn}/web/app/`
- **Stalwart data:** `/srv/{fqdn}/msg/` (only on mail-enabled vhosts)

### Permissions

- All files under `/srv/{fqdn}/` owned by `{user}:{user}` (matching UID:GID)
- Web server (FrankenPHP) runs as the vhost user — no www-data group needed
- `.git/` objects must match the vhost user (never root-owned)
- `storage/` and `bootstrap/cache/` writable by the vhost user

## Current Node State

### mko (production primary)

| UID | Name | Home | Vhost |
|-----|------|------|-------|
| 1000 | sysadm | /srv/mail.kanary.org/ | mail.kanary.org |
| 1001 | u1001 | /srv/kanary.org/ | kanary.org |
| 1002 | u1002 | /srv/web.kanary.org/ | web.kanary.org (markweb) |

Status: **Compliant**

### mmc (production node)

| UID | Name | Home | Vhost |
|-----|------|------|-------|
| 1000 | sysadm | /srv/mail.motd.com/ | mail.motd.com |
| 1001 | u1001 | /srv/motd.com/ | motd.com |
| 1002 | u1002 | /srv/web.motd.com/ | web.motd.com (markweb) |

Status: **Compliant** (stale `u:5000` removed 2026-03-05, `/srv/motd.com/` ownership fixed to u1001)

### gcwg (dev mesh node, Incus CT)

| UID | Name | Home | Vhost |
|-----|------|------|-------|
| 1000 | sysadm | /srv/mail.goldcoast.org/ | mail.goldcoast.org |
| 1001 | u1001 | /srv/goldcoast.org/ | goldcoast.org |
| 1002 | u1002 | /srv/web.goldcoast.org/ | web.goldcoast.org (markweb) |

Status: **Compliant**

### cachyos (dev workstation host)

| UID | Name | Home | Vhost |
|-----|------|------|-------|
| 1000 | sysadm | /home/sysadm/ | (system admin) |
| 1001 | markc | /home/markc/ | (desktop user) |

Status: **Desktop exception** — markc at 1001 is correct for workstation use. Dev markweb runs from `~/.gh/markweb/` (not `/srv/`). Incus CT `gcwg` handles the `/srv/` convention for this node's mesh identity.

## Remediation

### mmc: Remove stale user

```bash
ssh mmc
userdel u
groupdel u 2>/dev/null
```

### New node bootstrap

```bash
# 1. sysadm (already exists as first user on most distros — verify UID 1000)
usermod -l sysadm -d /srv/mail.${DOMAIN}/ -m $(id -un 1000) 2>/dev/null

# 2. Create vhost directory structure
for FQDN in mail.${DOMAIN} ${DOMAIN} web.${DOMAIN}; do
    mkdir -p /srv/${FQDN}/{msg,msg/admin,web,web/app,web/app/public}
done

# 3. Create additional users
useradd -u 1001 -g 1001 -d /srv/${DOMAIN}/ -s /bin/bash u1001
useradd -u 1002 -g 1002 -d /srv/web.${DOMAIN}/ -s /bin/bash u1002

# 4. Set ownership
chown -R sysadm:sysadm /srv/mail.${DOMAIN}/
chown -R u1001:u1001 /srv/${DOMAIN}/
chown -R u1002:u1002 /srv/web.${DOMAIN}/
```

## Rules

1. **Never create users with arbitrary UIDs** (no UID 5000, 2000, etc.)
2. **Never run artisan/bun as root** — always as the vhost user
3. **Never use www-data group** — FrankenPHP runs as the vhost user directly
4. **Git objects must match vhost user** — if root touches `.git/`, fix with `chown -R`
5. **One domain per user** — don't share UIDs across vhosts
6. **bun must be installed per-user** — `curl -fsSL https://bun.sh/install | bash` as the vhost user, not root
