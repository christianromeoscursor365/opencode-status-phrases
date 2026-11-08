import { readFileSync, writeFileSync } from "node:fs";
import { PHRASES } from "./phrases.js";

const list = PHRASES.map((p, i) => `${i + 1}. ${p}`).join("\n");
const topics = (
  await fetch("https://api.github.com/repos/christianromeoscursor365/opencode-status-phrases/topics", {
    headers: { Accept: "application/vnd.github+motto-topic-preview+json", Authorization: `token ${process.env.GH_TOKEN}` },
  }).then((r) => r.json())
).topics.map((t) => `#${t}`).join(" ");
const base = readFileSync("README.base.md", "utf8");
writeFileSync(
  "README.md",
  base
    .replace("{{TOPICS}}", topics)
    .replace("{{PHRASES}}", `## Все фразы (${PHRASES.length})\n\n${list}\n`)
);
console.log("README.md written, phrases:", PHRASES.length);
