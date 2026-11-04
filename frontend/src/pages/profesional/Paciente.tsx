import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { NotebookText, NotepadText } from "lucide-react";
import { ProfessionalPage } from "../../components/layout/ProfessionalPage";
import { Button } from "../../components/ui/Button";
import { DateRangeFilter } from "../../components/ui/DateRangeFilter";
import { inRange, type DateRange } from "../../components/ui/dateRange";
import { ConfirmDialog, Dialog } from "../../components/ui/Dialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { Field } from "../../components/ui/Field";
import { Menu } from "../../components/ui/Menu";
import { Skeleton } from "../../components/ui/Skeleton";
import { MOOD_LABELS, moodColor, type Mood } from "../../features/journal/moods";
import { professional, useProfessional } from "../../features/professional/store";
import { DESKTOP, useMediaQuery } from "../../hooks/useMediaQuery";
import { dateLabel, dayKey, dayLabel, timeLabel } from "../../lib/format";
import { professionalService, type ClinicalNote, type Patient, type SharedNote } from "../../services/professional";

const CLINICAL_MAX = 4000;

function firstName(name: string) {
  return name.split(" ")[0] || name;
}

// Las notas que compartió, por día y con sus filtros. Sin permiso activo no se pide ninguna: el servidor
// tampoco las entregaría. Cada cambio del permiso la monta de nuevo (`key`), y con eso vuelve a pedirlas.
function SharedNotes({ patient }: { patient: Patient }) {
  const [notes, setNotes] = useState<SharedNote[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [mood, setMood] = useState<Mood | null>(null);
  const [range, setRange] = useState<DateRange>({ from: "", to: "" });
  const name = firstName(patient.name);

  useEffect(() => {
    if (!patient.sharing) return;
    let alive = true;
    professionalService.patientNotes(patient.id).then(
      (list) => alive && setNotes(list),
      () => alive && setFailed(true)
    );
    return () => {
      alive = false;
    };
  }, [patient.id, patient.sharing]);

  const moods = useMemo(() => [...new Set((notes ?? []).flatMap((n) => (n.mood ? [n.mood] : [])))], [notes]);
  const groups = useMemo(() => {
    const list = (notes ?? [])
      .filter((n) => !mood || n.mood === mood)
      .filter((n) => inRange(dayKey(new Date(n.createdAt)), range))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const byDay: { key: string; label: string; notes: SharedNote[] }[] = [];
    for (const note of list) {
      const key = dayKey(new Date(note.createdAt));
      const last = byDay[byDay.length - 1];
      if (last?.key === key) last.notes.push(note);
      else byDay.push({ key, label: dayLabel(note.createdAt), notes: [note] });
    }
    return byDay;
  }, [notes, mood, range]);

  if (!patient.sharing) {
    return (
      <EmptyState icon={NotebookText} title={patient.shareChangedAt ? `${name} dejó de compartir su diario el ${dateLabel(patient.shareChangedAt)}.` : `${name} todavía no te compartió su diario.`}>
        Solo lo ves si te da permiso, y puede retirarlo cuando quiera. Sus notas privadas nunca se comparten.
      </EmptyState>
    );
  }
  if (failed) {
    return (
      <p role="alert" className="text-[15px] text-emotion">
        No pudimos traer sus notas. Revisa tu conexión e inténtalo otra vez.
      </p>
    );
  }
  if (!notes) return <Skeleton rows={3} shape="card" label="Cargando sus notas…" />;
  if (!notes.length) {
    return (
      <EmptyState icon={NotebookText} title={`${name} todavía no escribió notas que puedas leer.`}>
        Sus notas privadas no aparecen aquí.
      </EmptyState>
    );
  }

  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[13px] transition-colors duration-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
      active ? "border-voice/50 bg-voice/10 text-voice" : "border-border/70 text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-lg bg-surface px-4 py-4">
        {moods.length > 1 ? (
          <div role="group" aria-label="Ánimo" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={!mood} onClick={() => setMood(null)} className={chip(!mood)}>
              Todos
            </button>
            {moods.map((m) => (
              <button key={m} type="button" aria-pressed={mood === m} onClick={() => setMood(mood === m ? null : m)} className={chip(mood === m)}>
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: moodColor(m) }} />
                {MOOD_LABELS[m]}
              </button>
            ))}
          </div>
        ) : null}
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      {groups.length ? (
        groups.map((group) => (
          <section key={group.key} aria-label={group.label} className="space-y-2.5">
            <h3 className="sticky top-0 z-10 -mx-1 bg-background px-1 py-2 text-[13px] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
              {group.label}
            </h3>
            {group.notes.map((note) => (
              <article key={note.id} className="space-y-2 rounded-lg border border-border/40 bg-surface-raised p-4 shadow-raised dark:shadow-none">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                  {note.mood ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: moodColor(note.mood) }} />
                      {MOOD_LABELS[note.mood]}
                    </span>
                  ) : null}
                  {note.tags.length ? <span>{note.tags.join(" · ")}</span> : null}
                  <span>{timeLabel(note.createdAt)}</span>
                </p>
                <p className="whitespace-pre-wrap font-voice text-[17px] leading-[26px] text-foreground">{note.text}</p>
              </article>
            ))}
          </section>
        ))
      ) : (
        <p className="text-[15px] text-muted-foreground">Ninguna nota coincide con estos filtros.</p>
      )}
    </div>
  );
}

// Las notas clínicas del psicólogo sobre esta persona. Solo las ve quien las escribe.
function ClinicalNotes({ patient }: { patient: Patient }) {
  const [notes, setNotes] = useState<ClinicalNote[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const name = firstName(patient.name);

  useEffect(() => {
    let alive = true;
    professionalService.clinicalNotes(patient.id).then(
      (list) => alive && setNotes(list),
      () => alive && setFailed("No pudimos traer tus notas clínicas. Inténtalo otra vez.")
    );
    return () => {
      alive = false;
    };
  }, [patient.id]);

  const start = (note: ClinicalNote | null) => {
    setEditing(note ? note.id : "new");
    setDraft(note?.body ?? "");
    setFailed(null);
  };

  const save = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    try {
      const saved = await professionalService.saveClinicalNote(patient.id, editing === "new" ? null : editing, draft.trim());
      setNotes((list) => [saved, ...(list ?? []).filter((n) => n.id !== saved.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setEditing(null);
      setDraft("");
    } catch {
      setFailed("No pudimos guardar la nota. Lo que escribiste sigue aquí.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (noteId: string) => {
    try {
      await professionalService.deleteClinicalNote(noteId);
      setNotes((list) => (list ?? []).filter((n) => n.id !== noteId));
    } catch {
      setFailed("No pudimos borrar la nota. Inténtalo otra vez.");
    }
  };

  const editor = (
    <div className="space-y-3">
      <Field
        label={editing === "new" ? "Nota nueva" : "Editar la nota"}
        multiline
        rows={6}
        maxLength={CLINICAL_MAX}
        count={{ value: draft.length, max: CLINICAL_MAX }}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" className="h-11" onClick={() => void save()} disabled={!draft.trim()} aria-busy={busy || undefined}>
          {busy ? "Guardando…" : "Guardar"}
        </Button>
        <Button variant="secondary" size="sm" className="h-11" onClick={() => setEditing(null)}>
          Cancelar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-[13px] leading-[18px] text-muted-foreground">Solo tú las ves. {name} nunca las lee.</p>
      {failed ? (
        <p role="alert" className="text-[13px] text-emotion">
          {failed}
        </p>
      ) : null}
      {editing === "new" ? (
        editor
      ) : (
        <Button variant="secondary" size="sm" className="h-11" onClick={() => start(null)}>
          Nueva nota
        </Button>
      )}
      {!notes && !failed ? <Skeleton rows={2} label="Cargando tus notas clínicas…" /> : null}
      {notes && !notes.length && editing !== "new" ? <p className="text-[15px] text-muted-foreground">Todavía no escribiste notas sobre {name}.</p> : null}
      <ul className="space-y-3">
        {(notes ?? []).map((note) => (
          <li key={note.id} className="space-y-2 rounded-md border border-border/50 bg-surface-raised p-3">
            {editing === note.id ? (
              editor
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {dateLabel(note.createdAt)}
                  {note.updatedAt !== note.createdAt ? ` · editada el ${dateLabel(note.updatedAt)}` : ""}
                </p>
                <p className="whitespace-pre-wrap text-[15px] leading-[21px] text-foreground">{note.body}</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-11" onClick={() => start(note)} aria-label={`Editar la nota del ${dateLabel(note.createdAt)}`}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="h-11 !text-destructive" onClick={() => setDeleting(note.id)} aria-label={`Borrar la nota del ${dateLabel(note.createdAt)}`}>
                    Borrar
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && void remove(deleting)}
        title="¿Borrar esta nota clínica?"
        description="No se puede deshacer."
        confirmLabel="Borrar"
        destructive
      />
    </div>
  );
}

/**
 * La ficha de un paciente (DESIGN-WEB.md §10): lo que compartió de su diario (solo sus notas, nunca las
 * privadas ni las réplicas) y las notas clínicas del psicólogo. Aquí no habla la IA: no hay malva.
 */
export const Paciente: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { practice } = useProfessional();
  const wide = useMediaQuery(DESKTOP);
  const [clinicalOpen, setClinicalOpen] = useState(false);
  const [ending, setEnding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void professional.loadPractice();
  }, []);

  const p = practice.value;
  if (!p) {
    return (
      <ProfessionalPage title="Paciente">
        {practice.status === "error" ? (
          <p role="alert" className="text-[15px] text-emotion">
            No pudimos traer su ficha. Revisa tu conexión e inténtalo otra vez.
          </p>
        ) : (
          <Skeleton rows={3} shape="card" label="Cargando su ficha…" />
        )}
      </ProfessionalPage>
    );
  }
  const patient = p.patients.find((x) => x.id === id);
  if (!patient) return <Navigate to="/profesional/dashboard" replace />;
  const name = firstName(patient.name);
  const ended = !!patient.endedAt;

  const end = async () => {
    const ok = await professional.endCare(patient.conversationId);
    setNotice(ok ? `Dejaste de atender a ${name}. Lo verá en su chat.` : "No pudimos terminar el acompañamiento. Inténtalo otra vez.");
  };

  const clinical = <ClinicalNotes key={patient.id} patient={patient} />;

  return (
    <ProfessionalPage
      title={patient.name}
      description={
        ended
          ? `${patient.endedBy === "psychologist" ? `Dejaste de atender a ${name}` : `${name} terminó su proceso contigo`} el ${dateLabel(patient.endedAt ?? patient.since)}.`
          : `Le acompañas desde el ${dateLabel(patient.since)}.`
      }
      panelTitle="Notas clínicas"
      panel={wide ? <div className="mt-2">{clinical}</div> : undefined}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/profesional/dashboard"
          className="inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-semibold text-voice hover:bg-voice-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
        >
          Volver al panel
        </Link>
        <span className="flex-1" />
        {!wide ? (
          <Button variant="secondary" icon={<NotepadText size={16} aria-hidden="true" />} onClick={() => setClinicalOpen(true)}>
            Notas clínicas
          </Button>
        ) : null}
        <Menu
          label="Más acciones"
          items={[
            { label: ended ? "Ver la conversación" : "Escribirle", onSelect: () => navigate(`/profesional/mensajes/${patient.conversationId}`) },
            ...(ended ? [] : [{ label: "Dejar de atender", destructive: true, onSelect: () => setEnding(true) }]),
          ]}
        />
      </div>

      <p role="status" className={notice ? "rounded-md bg-surface px-4 py-3 text-[15px] text-foreground" : "sr-only"}>
        {notice}
      </p>

      <section aria-labelledby="paciente-diario" className="space-y-4">
        <h2 id="paciente-diario" className="font-replica text-xl font-medium leading-[26px] text-foreground">
          Su diario
        </h2>
        {ended ? (
          <EmptyState icon={NotebookText} title="El acompañamiento terminó.">
            Ya no ves su diario. Tus notas clínicas se quedan contigo.
          </EmptyState>
        ) : (
          <SharedNotes key={`${patient.id}-${patient.sharing}-${patient.shareChangedAt ?? ""}`} patient={patient} />
        )}
      </section>

      {!wide ? (
        <Dialog variant="side" open={clinicalOpen} onClose={() => setClinicalOpen(false)} title="Notas clínicas" closeLabel="Cerrar las notas clínicas">
          {clinical}
        </Dialog>
      ) : null}

      <ConfirmDialog
        open={ending}
        onClose={() => setEnding(false)}
        onConfirm={() => void end()}
        title={`¿Dejar de atender a ${name}?`}
        description={`Termina el acompañamiento: ya no podrán escribirse y dejarás de ver su diario. ${name} verá el aviso en su chat. Tus notas clínicas se quedan contigo.`}
        confirmLabel="Dejar de atender"
        destructive
      />
    </ProfessionalPage>
  );
};

export default Paciente;
