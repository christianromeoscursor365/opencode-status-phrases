import { createSignal, onCleanup } from "solid-js";
import { ComposerPill, createKeyed, Plugin } from "@opencode/plugin/gui";
import { PHRASES, toolIndex } from "../phrases.js";

function createController(minIntervalMs: number) {
  let last = -1;
  let lastAt = 0;
  return {
    pick(preferred?: number) {
      const now = Date.now();
      if (preferred !== undefined && preferred !== last && now - lastAt >= minIntervalMs) {
        last = preferred;
        lastAt = now;
        return last;
      }
      if (now - lastAt < minIntervalMs) return last;
      let next = preferred;
      if (next === undefined || next === last) {
        do {
          next = Math.floor(Math.random() * PHRASES.length);
        } while (PHRASES.length > 1 && next === last);
      }
      last = next;
      lastAt = now;
      return last;
    },
    reset() {
      last = -1;
      lastAt = 0;
    },
  };
}

const SHOW: Array<{ type: string; tool?: boolean }> = [
  { type: "session.execution.started" },
  { type: "session.step.started" },
  { type: "session.tool.input.started", tool: true },
  { type: "session.tool.called" },
];
const HIDE = [
  "session.execution.succeeded",
  "session.execution.failed",
  "session.execution.interrupted",
  "session.idle",
];

// sessionID lives in event.data, not at the event root (protocol contract)
const sidOf = (ev: any): string | undefined => ev?.data?.sessionID ?? ev?.sessionID;

// The host truncates long pill labels and the registry has no width field,
// so un-truncate only the pill's own capsule in the DOM. Scoped to the pill
// and at most 3 ancestors so chat containers keep their layout.
function widenPill() {
  if (typeof document === "undefined" || typeof document.evaluate !== "function") return;
  const found = document.evaluate(
    "//span[contains(text(),'\u2726')]",
    document.documentElement,
    null,
    7, // ORDERED_NODE_SNAPSHOT_TYPE
    null,
  );
  for (let i = 0; i < found.snapshotLength; i++) {
    const span = found.snapshotItem(i) as HTMLElement | null;
    if (!span) continue;
    for (let depth = 0; depth < 2; depth++) {
      const el = (depth === 0 ? span : span.parentElement) as HTMLElement | null;
      if (!el) break;
      const cs = getComputedStyle(el);
      const truncates =
        cs.textOverflow === "ellipsis" ||
        (cs.overflow !== "visible" && cs.overflow !== "") ||
        (cs.maxWidth !== "none" && cs.maxWidth !== "");
      if (truncates) {
        el.style.maxWidth = "none";
        el.style.overflow = "visible";
        el.style.textOverflow = "clip";
        el.style.flexShrink = "0";
      }
      el.style.whiteSpace = "nowrap";
    }
  }
}

let pending = 0;
function scheduleWiden() {
  if (pending || typeof setTimeout !== "function") return;
  pending = setTimeout(() => {
    pending = 0;
    widenPill();
  }, 100) as unknown as number;
}

export default Plugin.define({
  setup(ctx) {
    const controller = createController((ctx.options?.minIntervalMs as number) ?? 1500);
    const [getMap, setMap] = createSignal<Record<string, string>>({});

    ctx.add(ComposerPill, {
      id: "status",
      show: (input) => {
        const sid = input.session?.id;
        const phrase = sid ? getMap()[sid] : undefined;
        if (!phrase) return undefined;
        scheduleWiden();
        return { label: `\u2726 ${phrase}`, title: phrase };
      },
    });

    if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
      const mo = new MutationObserver(scheduleWiden);
      mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
      onCleanup(() => mo.disconnect());
    }

    createKeyed(
      () =>
        ctx.servers.get("sidecar")?.data ??
        ctx.servers.list().map((id) => ctx.servers.get(id)).find((s) => s?.builtin)?.data,
      (data) => {
        const offs: Array<() => void> = [];
        for (const { type, tool } of SHOW) {
          offs.push(
            data.on(type as never, (ev: any) => {
              const sid = sidOf(ev);
              if (!sid) return;
              const idx = controller.pick(toolIndex(tool ? ev?.data?.name : undefined));
              const phrase = PHRASES[idx ?? Math.floor(Math.random() * PHRASES.length)];
              setMap((m) => ({ ...m, [sid]: phrase }));
            }),
          );
        }
        for (const type of HIDE) {
          offs.push(
            data.on(type as never, (ev: any) => {
              const sid = sidOf(ev);
              if (!sid) return;
              controller.reset();
              setMap((m) => {
                if (!(sid in m)) return m;
                const copy = { ...m };
                delete copy[sid];
                return copy;
              });
            }),
          );
        }
        onCleanup(() => offs.forEach((off) => off()));
      },
    );
  },
});
