# The mvr.ac hub

This site is the apex (`https://mvr.ac/`). Subdomains run on a
separate VPS (Oracle Cloud, `146.235.51.189`) and are configured
declaratively in the
[`mandragora`](https://github.com/mvrozanti/mandragora) repo under
`hosts/mandragora-vps/compose/`.

## Subdomain map

| URL | Service | Auth |
|---|---|---|
| `mvr.ac` | this Next.js site | public |
| `www.mvr.ac` | 301 → apex | public |
| `auth.mvr.ac` | Authelia portal | public (the gate itself) |
| `hub.mvr.ac` | nginx static — button grid linking to every service | Authelia (password + TOTP) |
| `seafile.mvr.ac` | Seafile cloud storage | Authelia for `/` (web UI); native token auth on `/api2/*`, `/seafhttp/*`, `/seafdav/*`, `/notification/*` (mobile + sync clients can't follow OAuth redirects). Seafile's own 2FA also on for native auth. |
| `slither.mvr.ac` | RL slither.io simulator + dashboard | Authelia, with a path whitelist defense-in-depth (`/`, `/simulator.html`, `/static/*`, `/exported_agents/*`, `/api/*`, `/favicon.ico` only) |
| `cal.mvr.ac` | Radicale (CalDAV/CardDAV) | Radicale htpasswd only — CalDAV clients (DAVx⁵) can't follow OAuth redirects, so Authelia is out |
| `term.mvr.ac` | ttyd web shell on the desktop | **Tailnet IP gate AND then Authelia** — shell access is the strongest-gated endpoint |
| `paste.mvr.ac` | microbin paste service | Authelia (native microbin auth disabled — Authelia is the only gate) |
| `grafana.mvr.ac` | Grafana monitoring | Authelia + Grafana `auth.proxy` (Remote-User header auto-signin, no double login). Native Grafana login form disabled. |
| `mpd.mvr.ac` | myMPD — modern music player web client on the desktop | Authelia |
| `rgb.mvr.ac` | OpenRGB preset web control (11 presets: colors, breathing, rainbow, wave) | Authelia |
| `gen.mvr.ac` | Minimal text→image web wrapper around im-gen's FluxEngine | Authelia |
| `gh.mvr.ac` | 302 → `mvr.ac` (apex IS the GH Pages site, so this is redundant aliasing) | public |
| `*.mvrozanti.duckdns.org` | 302 → `*.mvr.ac` equivalents | public — legacy aliases during migration |

## DNS layout

- Apex `mvr.ac` → 4× GitHub Pages anycast (185.199.108–111.153)
- Wildcard `*.mvr.ac` → `146.235.51.189` (Oracle VPS)
- `www` CNAME → `mvrozanti.github.io.`

## Auth model

Authelia (at `auth.mvr.ac`) is the single sign-on point. One login
covers every gated service for the duration of the session cookie
(12h inactivity, 24h hard cap).

- **User identity**: file-backed (`users_database.yml` with argon2id
  hash); one user `m`.
- **Second factor**: TOTP from a phone authenticator app (Aegis on
  F-Droid or Google Authenticator). WebAuthn / passkeys are
  enabled but optional.
- **Brute-force regulation**: 3 retries / 2 min window / 15 min ban.
- **Session backend**: Redis (`authelia-redis` sidecar).
- **Notifications** (password reset / OTC codes): filesystem (no
  SMTP set up); read via
  `ssh mandragora-vps 'sudo docker exec authelia tail /data/notifications.txt'`.

For services that can't follow OAuth-style redirects (Radicale
CalDAV, Seafile mobile + sync), native auth stays in place
alongside Authelia. The two exclusions are deliberate.

## Where the hub config lives

| Concern | Repo path |
|---|---|
| Caddy labels (per-vhost) | `mandragora/hosts/mandragora-vps/compose/hub/docker-compose.yml` |
| Hub static UI (button grid HTML) | `mandragora/hosts/mandragora-vps/compose/hub/static/index.html` |
| Authelia (portal, config, users, rules) | `mandragora/.../compose/authelia/` |
| Seafile + Seadoc | `mandragora/.../compose/seafile/` |
| Radicale (calendar) | `mandragora/.../compose/radicale/` |
| Microbin (paste) | `mandragora/.../compose/microbin/` |
| Desktop systemd units (ttyd, slither, mympd, rgb-control, im-gen-web) | `mandragora/modules/services/` |
| Tailnet→VPS port-forwards | `mandragora/hosts/mandragora-vps/systemd/socat-tailnet@.service` |
| Grafana auth.proxy + sops secret_key | `mandragora/modules/core/monitoring.nix` |

A change to *this* repo only affects the apex landing page;
sibling services are self-contained on the VPS and unaffected.
