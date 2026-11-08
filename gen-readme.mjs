import { readFileSync, writeFileSync } from "node:fs";
import { PHRASES } from "./phrases.js";

const list = PHRASES.map((p, i) => `${i + 1}. ${p}`).join("\n");
// keep in sync with: gh repo edit ... --add-topic (GitHub API needs auth; offline is simpler)
const topics = "#opencode #opencode-plugin #plugin #status-phrases #russian #humor #desktop #tui #ai-coding #claude-code-alternative";
const base = readFileSync("README.base.md", "utf8");
writeFileSync(
  "README.md",
  base
    .replace("{{TOPICS}}", topics)
    .replace("{{PHRASES}}", `## Все фразы (${PHRASES.length})\n\n${list}\n`)
);
console.log("README.md written, phrases:", PHRASES.length);
