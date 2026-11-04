import type { ReplyContent, ReplyHandlers } from "./types";

// El titular entero y después el análisis palabra por palabra, a ritmo irregular: pausas más largas
// después de una coma o un punto. Devuelve cómo detenerlo.
export function paceReply(reply: ReplyContent, { onHeadline, onWord, onDone }: ReplyHandlers, firstDelay = 0) {
  const words = reply.body.split(" ");
  const timers: ReturnType<typeof setTimeout>[] = [];
  let elapsed = firstDelay;

  timers.push(setTimeout(() => onHeadline(reply.headline), elapsed));
  elapsed += 700;
  words.forEach((word, i) => {
    const pause = /[.,?]$/.test(words[i - 1] ?? "") ? 180 : 0;
    elapsed += 50 + ((i * 37) % 55) + pause;
    timers.push(setTimeout(() => onWord(word), elapsed));
  });
  timers.push(setTimeout(() => onDone(reply), elapsed + 60));

  return () => timers.forEach(clearTimeout);
}
