import React, { useMemo, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { DateRangeFilter } from "../../../components/ui/DateRangeFilter";
import type { DateRange } from "../../../components/ui/dateRange";
import { Dialog } from "../../../components/ui/Dialog";
import { Segmented } from "../../../components/ui/Segmented";
import { inputDate } from "../../../lib/format";
import { useAllDayReplies } from "../../journal/dayReplies";
import { useNotes } from "../../journal/store";
import { exportNotes, notesToExport, type ExportFormat } from "../export";

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "txt", label: "Texto" },
];

// Desde el día de la primera nota hasta hoy.
function fullRange(firstAt: string | undefined): DateRange {
  return { from: firstAt ? inputDate(new Date(firstAt)) : "", to: inputDate(new Date()) };
}

/** Exportar tus notas (RF-29, DESIGN-WEB.md §11): formato, fechas y si van las privadas. */
export const ExportDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const notes = useNotes();
  const dayReplies = useAllDayReplies();
  const firstAt = useMemo(() => notes.reduce<string | undefined>((min, n) => (!min || n.createdAt < min ? n.createdAt : min), undefined), [notes]);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [range, setRange] = useState<DateRange>(() => fullRange(firstAt));
  const [includePrivate, setIncludePrivate] = useState(false);
  const [working, setWorking] = useState(false);
  const [failed, setFailed] = useState(false);

  // Cada vez que se abre, empieza igual: todo, sin las privadas.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setRange(fullRange(firstAt));
      setIncludePrivate(false);
      setFailed(false);
    }
  }

  const count = useMemo(() => notesToExport(notes, range, includePrivate).length, [notes, range, includePrivate]);

  const run = async () => {
    setWorking(true);
    setFailed(false);
    try {
      await exportNotes(notes, dayReplies, { format, range, includePrivate });
      onClose();
    } catch {
      setFailed(true);
    } finally {
      setWorking(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Exportar tus notas"
      description="Un archivo con tus notas y sus réplicas, para guardarlo donde quieras."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => void run()} disabled={count === 0 || working}>
            {working ? "Exportando…" : "Exportar"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-[13px] text-muted-foreground" aria-hidden="true">
            Formato
          </p>
          <Segmented label="Formato" options={FORMATS} value={format} onChange={setFormat} className="w-full" />
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
        <div className="space-y-1">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] leading-[21px] text-foreground">
            <input
              type="checkbox"
              className="h-5 w-5 shrink-0 accent-[var(--voice)]"
              checked={includePrivate}
              onChange={(e) => setIncludePrivate(e.target.checked)}
              aria-describedby="export-private-hint"
            />
            Incluir mis notas privadas
          </label>
          <p id="export-private-hint" className="text-[13px] leading-[18px] text-muted-foreground">
            Solo tú las ves. Si las incluyes, quedan en el archivo.
          </p>
        </div>
        <p role="status" className="font-replica text-[17px] text-foreground">
          {count === 0 ? "No hay notas en esas fechas." : count === 1 ? "Se exporta 1 nota" : `Se exportan ${count} notas`}
        </p>
        {failed ? (
          <p role="alert" className="text-[13px] text-emotion">
            No pudimos crear el archivo. Inténtalo otra vez.
          </p>
        ) : null}
      </div>
    </Dialog>
  );
};
