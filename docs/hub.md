# The mvr.ac hub

This site is the apex (`https://mvr.ac/`). Subdomains run on a
separate VPS (Oracle Cloud, `146.235.51.189`) and are configured
declaratively in the
[`mandragora`](https://github.com/mvrozanti/mandragora) repo under
`hosts/mandragora-vps/compose/`.

## Subdomain map

| URL | Service | Visibility |
|---|---|---|
| `mvr.ac` | this Next.js site | public |
| `www.mvr.ac` | 301 → apex | public |
| `hub.mvr.ac` | gethomepage dashboard | public |
| `seafile.mvr.ac` | Seafile cloud storage | public |
| `slither.mvr.ac` | RL slither.io simulator + dashboard | public, path-whitelisted |
| `cal.mvr.ac` | Radicale (CalDAV/CardDAV) | public, htpasswd auth |
| `term.mvr.ac` | ttyd web shell on the desktop | tailnet-only (403 from public) |
| `paste.mvr.ac` | microbin paste service | tailnet-only |
| `grafana.mvr.ac` | Grafana monitoring | tailnet-only |

A duckdns alias (`*.mvrozanti.duckdns.org`) is also live as a
parallel route during the migration.

## DNS layout

- Apex `mvr.ac` → 4× GitHub Pages anycast (185.199.108–111.153)
- Wildcard `*.mvr.ac` → `146.235.51.189` (Oracle VPS)
- `www` CNAME → `mvrozanti.github.io.`

## Where the hub config lives

| Concern | Repo path |
|---|---|
| VPS Caddy labels (per-vhost) | `mandragora/hosts/mandragora-vps/compose/hub/docker-compose.yml` |
| Seafile + Seadoc | `mandragora/.../compose/seafile/` |
| Radicale (calendar) | `mandragora/.../compose/radicale/` |
| Microbin (paste) | `mandragora/.../compose/microbin/` |
| Desktop systemd units (ttyd, slither) | `mandragora/modules/services/` |
| Tailnet→VPS port-forwards | `mandragora/hosts/mandragora-vps/systemd/socat-tailnet@.service` |

A change to *this* repo only affects the apex landing page;
sibling services are self-contained on the VPS and unaffected.
