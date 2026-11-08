import { Plugin } from "@opencode/plugin/tui";
import { createSignal } from "solid-js";
import { createElement, insert, setProp } from "@opentui/solid";
import { PHRASES, toolIndex, createPhraseController } from "./phrases.js";

const SHOW = new Set([
  "session.execution.started",
  "session.step.started",
  "session.tool.called",
]);
const HIDE = new Set([
  "session.execution.succeeded",
  "session.execution.failed",
  "session.execution.interrupted",
  "session.idle",
]);

function makeNode(getText, theme) {
  const node = createElement("text");
  if (theme?.textMuted !== undefined) setProp(node, "fg", theme.textMuted);
  // accessor insert keeps Solid reactivity (same pattern as agents-sidebar)
  insert(node, getText);
  const box = createElement("box");
  setProp(box, "width", "100%");
  insert(box, node);
  return box;
}

export default Plugin.define({
  id: "status-phrases.tui",
  setup(context) {
    const controller = createPhraseController({
      minIntervalMs: context.options?.minIntervalMs ?? 1500,
    });
    const [getPhrase, setPhrase] = createSignal(null);
    const [getSession, setSession] = createSignal(undefined);

    const unsub = context.data.listen((event) => {
      const ev = event?.details ?? event;
      if (!ev || typeof ev.type !== "string") return;
      if (SHOW.has(ev.type)) {
        const tool = ev.tool ?? ev.name ?? ev.metadata?.tool;
        setPhrase(PHRASES[controller.pick(toolIndex(tool), Date.now())] ?? null);
        setSession(ev.sessionID);
      } else if (HIDE.has(ev.type)) {
        controller.reset();
        setPhrase(null);
      }
    });

    const textFor = (input) => () => {
      const phrase = getPhrase();
      if (!phrase) return "";
      if (input?.sessionID && getSession() && input.sessionID !== getSession()) return "";
      return `\u2726 ${phrase}`;
    };

    const off1 = context.ui.slot({
      append: "home.footer.status",
      render: () => makeNode(textFor(), context.theme),
    });
    const off2 = context.ui.slot({
      append: "prompt.footer.status",
      render: (input) => makeNode(textFor(input), context.theme),
    });

    return () => {
      unsub();
      off1();
      off2();
    };
  },
});
