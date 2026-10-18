import { useState } from "react";
import type { CSSProperties } from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import { Github, Globe, Linkedin, Mail } from "lucide-react";
import { identity, labels, monthShort, monthYear, projects, roles } from "@/data/cv";
import type { Lang } from "@/data/cv";

type Week = { contributionDays: { contributionCount: number; date: string }[] };
type Service = { name: string; host: string; desc: string; access: string };
type Props = { weeks: Week[]; publicServices: Service[]; totalServices: number };

const AVATAR = `https://avatars.githubusercontent.com/${identity.github}?s=160`;
const CELL = 10;
const GAP = 2;
const LEFT = 28;
const TOP = 16;

const stagger = (i: number, j?: number) =>
  ({ "--i": i, ...(j === undefined ? {} : { "--j": j }) }) as CSSProperties;

function Heatmap({ weeks, lang }: { weeks: Week[]; lang: Lang }) {
  const counts = weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount));
  const total = counts.reduce((a, b) => a + b, 0);
  const peak = Math.max(1, ...counts);
  const width = LEFT + weeks.length * (CELL + GAP);
  const height = TOP + 7 * (CELL + GAP) + 4;
  const months: { x: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, i) => {
    const first = new Date(w.contributionDays[0].date + "T00:00:00Z");
    const m = first.getUTCMonth();
    if (m !== lastMonth && i < weeks.length - 1) {
      lastMonth = m;
      if (i === 0 || first.getUTCDate() <= 7) months.push({ x: LEFT + i * (CELL + GAP), label: monthShort(m, lang) });
    }
  });
  const dayLabels = lang === "en" ? ["Mon", "Wed", "Fri"] : ["seg", "qua", "sex"];
  return (
    <div className="heat">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${total} ${labels[lang].contributions}`}>
        {months.map((m) => (
          <text key={m.x} className="mtxt" x={m.x} y={10}>{m.label}</text>
        ))}
        {dayLabels.map((d, k) => (
          <text key={d} className="mtxt" x={0} y={TOP + (1 + k * 2) * (CELL + GAP) + 8}>{d}</text>
        ))}
        {weeks.map((w, i) =>
          w.contributionDays.map((d) => {
            const dow = new Date(d.date + "T00:00:00Z").getUTCDay();
            const level = d.contributionCount === 0 ? 0 : Math.min(4, Math.ceil((d.contributionCount / peak) * 4));
            return (
              <rect
                key={d.date}
                className={`h${level}`}
                style={{ "--c": i } as CSSProperties}
                x={LEFT + i * (CELL + GAP)}
                y={TOP + dow * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2}
              >
                <title>{`${d.contributionCount} · ${d.date}`}</title>
              </rect>
            );
          }),
        )}
      </svg>
      <div className="cap">
        {total.toLocaleString(lang === "en" ? "en-US" : "pt-BR")} {labels[lang].contributions} · {labels[lang].peak} {peak} {labels[lang].inADay}
      </div>
    </div>
  );
}

export default function Home({ weeks, publicServices, totalServices }: Props) {
  const [lang, setLang] = useState<Lang>("en");
  const L = labels[lang];
  const hidden = totalServices - publicServices.length;
  return (
    <>
      <Head>
        <title>{`${identity.name} · ${identity.title}`}</title>
        <meta name="description" content={`${identity.name} — ${identity.title}, ${identity.location}. Résumé, open source and the services running on mvr.ac.`} />
      </Head>
      <div className="page">
        <article className="sheet">
          <aside className="aside">
            <img className="avatar" src={AVATAR} alt="" width={72} height={72} style={stagger(0)} />
            <h1 style={stagger(1)}>{identity.name}</h1>
            <div className="role" style={stagger(2)}>
              {identity.title}
              <br />
              {identity.location}
            </div>
            <div className="blk" style={stagger(3)}>
              <p className="lbl">{L.contact}</p>
              <div className="kv contact">
                <a href={`mailto:${identity.email}`}><Mail aria-hidden="true" /><span>{identity.email}</span></a>
                <a href={`https://github.com/${identity.github}`}><Github aria-hidden="true" /><span>github.com/{identity.github}</span></a>
                <a href={`https://linkedin.com/in/${identity.linkedin}`}><Linkedin aria-hidden="true" /><span>linkedin.com/in/{identity.linkedin}</span></a>
                <a href={`https://${identity.site}`}><Globe aria-hidden="true" /><span>{identity.site}</span></a>
              </div>
            </div>
            <div className="blk" style={stagger(4)}>
              <p className="lbl">{L.skills}</p>
              {identity.skills.map(([name, level], k) => (
                <div className="skill" key={name}>
                  <span>{name}</span>
                  <span className="pips" aria-label={`${level} of 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <i key={n} className={n <= level ? "on" : ""} style={stagger(k, n)} />
                    ))}
                  </span>
                </div>
              ))}
            </div>
            <div className="blk" style={stagger(5)}>
              <p className="lbl">{L.languages}</p>
              <div className="kv">
                {identity.languages[lang].map(([name, level]) => (
                  <div key={name}>{name} — {level}</div>
                ))}
              </div>
            </div>
            <div className="blk" style={stagger(6)}>
              <p className="lbl">{L.education}</p>
              <div className="kv">{identity.education[lang]}</div>
            </div>
          </aside>

          <main className="main">
            <div className="topline">
              <h2>{L.experience}</h2>
              <div className="actions">
                <div className="lang" role="group" aria-label="language">
                  <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
                  <button type="button" className={lang === "pt" ? "on" : ""} onClick={() => setLang("pt")}>PT-BR</button>
                </div>
                <a className="btn" href={identity.cvPdf[lang]}>{L.pdf} ↓</a>
              </div>
            </div>
            {roles.map((r, i) => (
              <div className="xp" key={r.company + r.from} style={stagger(i)}>
                <div className="when">
                  {monthYear(r.from, lang)} –<br />
                  {r.to ? monthYear(r.to, lang) : L.present}
                </div>
                <div>
                  <div className="t">
                    {r.title} <span>· {r.company}{r.detail ? ` · ${r.detail}` : ""}</span>
                  </div>
                  <div className="what">{r.summary}</div>
                  <div className="st">{r.stack.join(" · ")}</div>
                </div>
              </div>
            ))}
          </main>

          <div className="rail">
            <div className="sec" style={stagger(0)}>
              <h2>{L.projects}</h2>
              {projects.map((p) => (
                <div className="pj" key={p.name}>
                  <div className="n">
                    <a href={`https://github.com/${identity.github}/${p.name}`}>{p.name}</a>
                    {p.stars ? <i>{p.stars} ★</i> : null}
                  </div>
                  <div className="d">{p.description}</div>
                </div>
              ))}
            </div>
            <div className="sec" style={stagger(1)}>
              <h2>{L.also}</h2>
              <div className="also">
                {publicServices.map((s, i) => (
                  <span key={s.host}>
                    {i > 0 ? " · " : ""}
                    <a href={`https://${s.host}`} title={s.desc}>{s.name}</a>
                  </span>
                ))}
                <br />
                <a className="ghost" href="https://hub.mvr.ac">+{hidden} {L.behind} →</a>
              </div>
            </div>
          </div>

          <div className="band">
            <p className="lbl">{L.github}</p>
            <Heatmap weeks={weeks} lang={lang} />
          </div>
        </article>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const root = process.cwd();
  const weeks: Week[] = JSON.parse(await fs.readFile(path.join(root, "public", "contributions.json"), "utf8"));
  const hub = JSON.parse(await fs.readFile(path.join(root, "data", "services.json"), "utf8"));
  const services: Service[] = hub.services;
  const publicServices = services.filter((s) => s.access === "open" && !["root", "api"].includes(s.name));
  return { props: { weeks, publicServices, totalServices: services.length } };
};
