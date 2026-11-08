import { readFileSync, writeFileSync } from "node:fs";
import { PHRASES } from "./phrases.js";

const list = PHRASES.map((p, i) => `${i + 1}. ${p}`).join("\n");
const base = readFileSync("README.base.md", "utf8");
writeFileSync("README.md", base.replace("{{PHRASES}}", `## Все фразы (${PHRASES.length})\n\n${list}\n`));
console.log("README.md written, phrases:", PHRASES.length);
