import type { DateRange } from "../../components/ui/dateRange";
import { capitalize, dateLabel, dayKey, inputDate, timeLabel } from "../../lib/format";
import type { ReplyContent } from "../../services/ai/types";
import { repliesOfDay } from "../journal/dayReplies";
import { MOOD_LABELS } from "../journal/moods";
import { replyModeOf } from "../journal/store";
import type { DayReply, Note } from "../journal/types";

// Exportar notas (RF-29, DESIGN-WEB.md §11): un archivo con las notas propias y sus réplicas, armado en
// el navegador con lo que ya está en el diario. Nunca sale de otra cuenta, y no pasa por el servidor.

export type ExportFormat = "pdf" | "txt";

export type ExportOptions = { format: ExportFormat; range: DateRange; includePrivate: boolean };

// Las notas que entran, de la más vieja a la más nueva.
export function notesToExport(notes: Note[], range: DateRange, includePrivate: boolean) {
  return notes
    .filter((n) => includePrivate || replyModeOf(n) !== "private")
    .filter((n) => {
      const day = inputDate(new Date(n.createdAt));
      return (!range.from || day >= range.from) && (!range.to || day <= range.to);
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// Lo que se escribe, en bloques: así el texto plano y el PDF dicen lo mismo.
type Block =
  | { kind: "title"; text: string }
  | { kind: "subtitle"; text: string }
  | { kind: "day"; text: string }
  | { kind: "meta"; text: string }
  | { kind: "text"; text: string }
  | { kind: "label"; text: string }
  | { kind: "gap" };

function replyBlocks(label: string, reply: ReplyContent): Block[] {
  return [
    { kind: "label", text: `${label}: ${reply.headline}` },
    { kind: "text", text: reply.body },
    ...reply.questions.map((q): Block => ({ kind: "text", text: `· ${q}` })),
  ];
}

function blocksOf(notes: Note[], dayReplies: Record<string, DayReply>, range: DateRange): Block[] {
  const first = notes[0]?.createdAt;
  const last = notes[notes.length - 1]?.createdAt;
  const from = range.from ? dateLabel(`${range.from}T12:00:00`) : first ? dateLabel(first) : "";
  const to = range.to ? dateLabel(`${range.to}T12:00:00`) : last ? dateLabel(last) : "";
  const blocks: Block[] = [
    { kind: "title", text: "Replica · Tus notas" },
    { kind: "subtitle", text: `Del ${from} al ${to} · ${notes.length === 1 ? "1 nota" : `${notes.length} notas`}` },
  ];

  const days = new Map<string, Note[]>();
  for (const note of notes) {
    const key = dayKey(new Date(note.createdAt));
    days.set(key, [...(days.get(key) ?? []), note]);
  }

  for (const [key, list] of days) {
    const { night, late } = repliesOfDay(dayReplies, key);
    const comments = [...(night?.reply?.comments ?? []), ...(late?.reply?.comments ?? [])];
    blocks.push(
      { kind: "gap" },
      {
        kind: "day",
        text: capitalize(new Date(list[0].createdAt).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" })),
      }
    );
    for (const note of list) {
      const meta = [
        timeLabel(note.createdAt),
        note.mood ? `Ánimo: ${MOOD_LABELS[note.mood]}` : null,
        note.tags[0] ? `Tema: ${note.tags[0]}` : null,
        replyModeOf(note) === "private" ? "Nota privada" : null,
      ].filter(Boolean);
      blocks.push({ kind: "gap" }, { kind: "meta", text: meta.join(" · ") });
      if (note.prompt) blocks.push({ kind: "label", text: `Escribiste sobre: ${note.prompt}` });
      blocks.push({ kind: "text", text: note.text });
      if (note.reply) blocks.push(...replyBlocks("Réplica", note.reply));
      for (const comment of comments.filter((c) => c.noteId === note.id)) {
        blocks.push({ kind: "label", text: "La réplica del día" }, { kind: "text", text: comment.text });
      }
    }
    if (night?.reply) blocks.push({ kind: "gap" }, ...replyBlocks("Réplica del día", night.reply));
    if (late?.reply) blocks.push({ kind: "gap" }, ...replyBlocks("Última réplica", late.reply));
  }
  return blocks;
}

function toText(blocks: Block[]) {
  return `${blocks
    .map((b) => {
      if (b.kind === "gap") return "";
      if (b.kind === "day") return b.text.toUpperCase();
      return b.text;
    })
    .join("\n")}\n`;
}

// Las fuentes estándar del PDF solo tienen los caracteres latinos: lo demás se cambia por su
// equivalente simple o se quita.
function latin(text: string) {
  return text
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\t\n\r\x20-\x7E\xA0-\xFF]/g, "");
}

async function toPdf(blocks: Block[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const bottom = doc.internal.pageSize.getHeight() - margin;
  let y = margin;

  const STYLES: Record<Exclude<Block["kind"], "gap">, { font: string; style: string; size: number; leading: number; gray: number }> = {
    title: { font: "times", style: "normal", size: 22, leading: 28, gray: 30 },
    subtitle: { font: "helvetica", style: "normal", size: 10, leading: 16, gray: 110 },
    day: { font: "times", style: "bold", size: 14, leading: 20, gray: 30 },
    meta: { font: "helvetica", style: "normal", size: 9, leading: 14, gray: 110 },
    label: { font: "times", style: "italic", size: 11.5, leading: 16, gray: 60 },
    text: { font: "helvetica", style: "normal", size: 10.5, leading: 15, gray: 30 },
  };

  for (const block of blocks) {
    if (block.kind === "gap") {
      y += 10;
      continue;
    }
    const s = STYLES[block.kind];
    doc.setFont(s.font, s.style);
    doc.setFontSize(s.size);
    doc.setTextColor(s.gray);
    const lines = doc.splitTextToSize(latin(block.text), width) as string[];
    for (const line of lines) {
      if (y + s.leading > bottom) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y + s.size);
      y += s.leading;
    }
  }
  return doc.output("blob");
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportNotes(notes: Note[], dayReplies: Record<string, DayReply>, options: ExportOptions) {
  const list = notesToExport(notes, options.range, options.includePrivate);
  const blocks = blocksOf(list, dayReplies, options.range);
  const from = options.range.from || (list[0] ? inputDate(new Date(list[0].createdAt)) : "");
  const to = options.range.to || (list.length ? inputDate(new Date(list[list.length - 1].createdAt)) : "");
  const name = `replica-notas-${from}-a-${to}.${options.format}`;
  const blob = options.format === "pdf" ? await toPdf(blocks) : new Blob([toText(blocks)], { type: "text/plain;charset=utf-8" });
  download(blob, name);
}
