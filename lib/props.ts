import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Props, Week } from "@/pages/index";

export async function loadProps(): Promise<Omit<Props, "initialLang">> {
  const root = process.cwd();
  const weeks: Week[] = JSON.parse(await readFile(path.join(root, "public", "contributions.json"), "utf8"));
  return { weeks };
}
