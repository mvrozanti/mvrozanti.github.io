export type Role = {
  company: string;
  title: string;
  detail?: string;
  from: string;
  to: string | null;
  summary: string;
  stack: string[];
};

export type Project = {
  name: string;
  stars?: string;
  description: string;
};

export type Lang = "en" | "pt";

export const identity = {
  name: "Marcelo Vironda Rozanti",
  title: "Senior Software Engineer",
  location: "São Paulo, Brazil",
  email: "mvrozanti@hotmail.com",
  github: "mvrozanti",
  linkedin: "mvrozanti",
  site: "mvr.ac",
  cvHome: "https://cv.mvr.ac",
  cvPdf: {
    en: "https://cv.mvr.ac/marcelo-vironda-rozanti-en-impact.pdf",
    pt: "https://cv.mvr.ac/marcelo-vironda-rozanti-pt-impact.pdf",
  },
  education: {
    en: "B.Sc. Computer Science, Universidade Presbiteriana Mackenzie, 2020",
    pt: "Bacharelado em Ciência da Computação, Universidade Presbiteriana Mackenzie, 2020",
  },
  skills: [
    ["Java", 5],
    ["Shell", 5],
    ["Kotlin", 4],
    ["Python", 4],
    ["C/C++", 3],
  ] as [string, number][],
  languages: {
    en: [
      ["Portuguese", "native"],
      ["English", "fluent"],
      ["Spanish", "intermediate"],
    ],
    pt: [
      ["Português", "nativo"],
      ["Inglês", "fluente"],
      ["Espanhol", "intermediário"],
    ],
  } as Record<Lang, [string, string][]>,
};

export const roles: Role[] = [
  {
    company: "SRM Asset",
    title: "Senior Software Engineer",
    from: "2026-03",
    to: null,
    summary: "Backend integrations with the B3 and CERC registries for duplicatas escriturais, and with QI Tech.",
    stack: ["Java 21", "Spring", "Aurora PostgreSQL", "AWS", "Terraform", "RabbitMQ"],
  },
  {
    company: "C6 Bank",
    title: "Senior Engineer",
    from: "2025-04",
    to: "2026-03",
    summary: "High-availability systems for credit granting, with an information-security focus.",
    stack: ["Kotlin", "Spring", "MongoDB", "PostgreSQL", "Splunk", "Event Sourcing"],
  },
  {
    company: "Fiserv",
    title: "Web Developer",
    from: "2024-03",
    to: "2025-04",
    summary: "POS software: development, monitoring, DevSecOps pipelines, disaster prevention and recovery.",
    stack: ["Spring", "Oracle SQL", "Dynatrace", "Splunk", "Fortify", "Redis"],
  },
  {
    company: "Freelance",
    title: "Backend Developer",
    detail: "Upwork, remote",
    from: "2022-10",
    to: "2024-01",
    summary: "Backend services and data-extraction pipelines for international clients.",
    stack: ["Python", "lxml", "headless Chromium", "Bash"],
  },
  {
    company: "Conta Azul",
    title: "Backend Developer",
    from: "2021-09",
    to: "2022-08",
    summary: "Automated periodic and aperiodic Brazilian fiscal obligations: SPED, eSocial, EFD-Reinf.",
    stack: ["Java", "Spring", "AWS", "Terraform", "PostgreSQL"],
  },
  {
    company: "Grão",
    title: "Backend Developer",
    from: "2020-12",
    to: "2021-09",
    summary: "Backend for Pix, Brazil's instant payment system; containerized test and production environments.",
    stack: ["Kotlin", "Java EE", "MySQL", "Spring", "GitLab CI"],
  },
  {
    company: "Raia Drogasil",
    title: "Developer",
    from: "2020-01",
    to: "2020-12",
    summary: "Selling-operations systems and LGPD compliance; biometric readers and thermal printers.",
    stack: ["Java EE", "JSF/PrimeFaces", "Oracle SQL", "JBoss"],
  },
  {
    company: "Sys4Bank",
    title: "Developer",
    from: "2016-03",
    to: "2020-01",
    summary: "Bank infrastructure: Spring Boot services, containerization, CI/CD.",
    stack: ["Java", "Spring Boot", "MSSQL", "Maven", "Bash"],
  },
];

export const projects: Project[] = [
  { name: "RAT-via-Telegram", stars: "600+", description: "Windows remote administration over Telegram, in Python" },
  { name: "dte", stars: "300+", description: "a date-and-time processing language" },
  { name: "mandragora", description: "the declarative NixOS workstation and VPS behind this domain" },
  { name: "vault-graph", description: "force-directed canvas viewer for a markdown vault; powers demo.mvr.ac" },
  { name: "rule-110-compiler", description: "brainfuck → Turing machine → Rule 110, visualised at rule110.mvr.ac" },
  { name: "vtag", description: "local-VLM image tagging CLI: Ollama, Qwen2.5-VL, RapidOCR, XMP sidecars" },
];

export const labels: Record<Lang, Record<string, string>> = {
  en: {
    experience: "Experience",
    projects: "Projects",
    education: "Education",
    languages: "Languages",
    skills: "Programming",
    contact: "Contact",
    present: "present",
    github: "GitHub, last year",
    also: "Also running",
    behind: "behind sign-in",
    pdf: "PDF",
    contributions: "contributions in the last year",
    peak: "peak",
    inADay: "in a day",
  },
  pt: {
    experience: "Experiência",
    projects: "Projetos",
    education: "Formação",
    languages: "Idiomas",
    skills: "Programação",
    contact: "Contato",
    present: "atual",
    github: "GitHub, último ano",
    also: "Também no ar",
    behind: "atrás do login",
    pdf: "PDF",
    contributions: "contribuições no último ano",
    peak: "pico de",
    inADay: "em um dia",
  },
};

const MONTHS: Record<Lang, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  pt: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
};

export function monthYear(ym: string, lang: Lang): string {
  const [y, m] = ym.split("-");
  return `${MONTHS[lang][Number(m) - 1]} ${y}`;
}

export function monthShort(monthIndex: number, lang: Lang): string {
  return MONTHS[lang][monthIndex];
}
