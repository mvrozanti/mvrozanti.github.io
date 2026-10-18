export type Lang = "en" | "pt";

export type Text = Record<Lang, string>;

export type Role = {
  company: string;
  title: Text;
  detail?: Text;
  from: string;
  to: string | null;
  summary: Text;
  stack: string[];
};

export type Project = {
  name: string;
  stars?: string;
  description: Text;
};

export const identity = {
  name: "Marcelo Vironda Rozanti",
  title: { en: "Senior Software Engineer", pt: "Engenheiro de Software Sênior" },
  location: { en: "São Paulo, Brazil", pt: "São Paulo, Brasil" },
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
    title: { en: "Senior Software Engineer", pt: "Engenheiro de Software Sênior" },
    from: "2026-03",
    to: null,
    summary: { en: "Backend integrations with the B3 and CERC registries for duplicatas escriturais, and with QI Tech.", pt: "Integrações backend com as registradoras B3 e CERC para duplicatas escriturais, e com a QI Tech." },
    stack: ["Java 21", "Spring", "Aurora PostgreSQL", "AWS", "Terraform", "RabbitMQ"],
  },
  {
    company: "C6 Bank",
    title: { en: "Senior Engineer", pt: "Engenheiro Sênior" },
    from: "2025-04",
    to: "2026-03",
    summary: { en: "High-availability systems for credit granting, with an information-security focus.", pt: "Sistemas de alta disponibilidade para concessão de crédito, com foco em segurança da informação." },
    stack: ["Kotlin", "Spring", "MongoDB", "PostgreSQL", "Splunk", "Event Sourcing"],
  },
  {
    company: "Fiserv",
    title: { en: "Web Developer", pt: "Desenvolvedor Web" },
    from: "2024-03",
    to: "2025-04",
    summary: { en: "POS software: development, monitoring, DevSecOps pipelines, disaster prevention and recovery.", pt: "Software de POS: desenvolvimento, monitoramento, pipelines DevSecOps, prevenção e recuperação de desastres." },
    stack: ["Spring", "Oracle SQL", "Dynatrace", "Splunk", "Fortify", "Redis"],
  },
  {
    company: "Freelance",
    title: { en: "Backend Developer", pt: "Desenvolvedor Backend" },
    detail: { en: "Upwork, remote", pt: "Upwork, remoto" },
    from: "2022-10",
    to: "2024-01",
    summary: { en: "Backend services and data-extraction pipelines for international clients.", pt: "Serviços backend e pipelines de extração de dados para clientes internacionais." },
    stack: ["Python", "lxml", "headless Chromium", "Bash"],
  },
  {
    company: "Conta Azul",
    title: { en: "Backend Developer", pt: "Desenvolvedor Backend" },
    from: "2021-09",
    to: "2022-08",
    summary: { en: "Automated periodic and aperiodic Brazilian fiscal obligations: SPED, eSocial, EFD-Reinf.", pt: "Automação de obrigações fiscais periódicas e pontuais: SPED, eSocial, EFD-Reinf." },
    stack: ["Java", "Spring", "AWS", "Terraform", "PostgreSQL"],
  },
  {
    company: "Grão",
    title: { en: "Backend Developer", pt: "Desenvolvedor Backend" },
    from: "2020-12",
    to: "2021-09",
    summary: { en: "Backend for Pix, Brazil's instant payment system; containerized test and production environments.", pt: "Backend do Pix, o sistema brasileiro de pagamento instantâneo; ambientes de teste e produção containerizados." },
    stack: ["Kotlin", "Java EE", "MySQL", "Spring", "GitLab CI"],
  },
  {
    company: "Raia Drogasil",
    title: { en: "Developer", pt: "Desenvolvedor" },
    from: "2020-01",
    to: "2020-12",
    summary: { en: "Selling-operations systems and LGPD compliance; biometric readers and thermal printers.", pt: "Sistemas de operações de venda e adequação à LGPD; leitores biométricos e impressoras térmicas." },
    stack: ["Java EE", "JSF/PrimeFaces", "Oracle SQL", "JBoss"],
  },
  {
    company: "Sys4Bank",
    title: { en: "Developer", pt: "Desenvolvedor" },
    from: "2016-03",
    to: "2020-01",
    summary: { en: "Bank infrastructure: Spring Boot services, containerization, CI/CD.", pt: "Infraestrutura bancária: serviços Spring Boot, containerização, CI/CD." },
    stack: ["Java", "Spring Boot", "MSSQL", "Maven", "Bash"],
  },
];

export const projects: Project[] = [
  { name: "RAT-via-Telegram", stars: "600+", description: { en: "Windows remote administration over Telegram, in Python", pt: "administração remota de Windows via Telegram, em Python" } },
  { name: "dte", stars: "300+", description: { en: "a date-and-time processing language", pt: "uma linguagem de processamento de data e hora" } },
  { name: "mandragora", description: { en: "the declarative NixOS workstation and VPS behind this domain", pt: "a estação NixOS e o VPS declarativos por trás deste domínio" } },
  { name: "vault-graph", description: { en: "force-directed canvas viewer for a markdown vault; powers demo.mvr.ac", pt: "visualizador canvas de grafo de força para um vault markdown; move o demo.mvr.ac" } },
  { name: "rule-110-compiler", description: { en: "brainfuck → Turing machine → Rule 110, visualised at rule110.mvr.ac", pt: "brainfuck → máquina de Turing → Regra 110, visualizado em rule110.mvr.ac" } },
  { name: "vtag", description: { en: "local-VLM image tagging CLI: Ollama, Qwen2.5-VL, RapidOCR, XMP sidecars", pt: "CLI de tagueamento de imagens com VLM local: Ollama, Qwen2.5-VL, RapidOCR, sidecars XMP" } },
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
