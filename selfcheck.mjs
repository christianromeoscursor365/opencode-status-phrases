import { PHRASES, toolIndex, createPhraseController } from "./phrases.js";

if (PHRASES.length !== 91) throw new Error("count " + PHRASES.length);
if (new Set(PHRASES).size !== PHRASES.length) throw new Error("duplicates");
if (PHRASES.some((p) => /\.\.|,,|\s$/.test(p))) throw new Error("bad punctuation");
// TOOL_MAP indices must point at the original mapped phrases
const c = createPhraseController({ minIntervalMs: 1500 });
let last = -2; // t=0 returns -1 (controller throttles vs lastAt=0); real time is >> 0
for (let t = 2000; t < 40000; t += 2000) {
  const i = c.pick(undefined, t);
  if (i === last) throw new Error("repeat at " + t);
  last = i;
}
if (toolIndex("read") !== 1 || toolIndex("edit") !== 13 || toolIndex("shell") !== 9)
  throw new Error("tool map broken");
console.log("selfcheck OK: " + PHRASES.length + " phrases");
