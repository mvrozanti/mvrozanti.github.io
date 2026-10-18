import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Props, Service, Week } from "@/pages/index";

export async function loadProps(): Promise<Omit<Props, "initialLang">> {
  const root = process.cwd();
  const weeks: Week[] = JSON.parse(await readFile(path.join(root, "public", "contributions.json"), "utf8"));
  const hub = JSON.parse(await readFile(path.join(root, "data", "services.json"), "utf8"));
  const services: Service[] = hub.services;
  const publicServices = services.filter((s) => s.access === "open" && !["root", "api"].includes(s.name));
  return { weeks, publicServices, totalServices: services.length };
}
