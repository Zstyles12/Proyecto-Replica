import React, { useEffect, useId, useState } from "react";
import { describeSchedule, withinSchedule } from "../../features/care/schedule";
import { Link } from "react-router-dom";
import { CalendarClock, Inbox, NotebookText, Users, Video } from "lucide-react";
import { ProfessionalPage } from "../../components/layout/ProfessionalPage";
import { Button } from "../../components/ui/Button";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { ConfirmDialog, Dialog } from "../../components/ui/Dialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { Field } from "../../components/ui/Field";
import { Segmented } from "../../components/ui/Segmented";
import { Skeleton } from "../../components/ui/Skeleton";
import { Avatar } from "../../features/care/components/CareParts";
import { MetricTile } from "../../features/profile/components/MetricTile";
import {
  activePatients,
  endedPatients,
  professional,
  shareEvents,
  upcomingSessions,
  useProfessional,
} from "../../features/professional/store";
import { DESKTOP, useMediaQuery } from "../../hooks/useMediaQuery";
import { dateLabel, inputDate, sessionLabel, timeLabel } from "../../lib/format";
import type { Availability, Patient, Practice, PracticeRequest } from "../../services/professional";

// De lunes a domingo, como se piensa una semana de trabajo. 0 es domingo.
const WEEK: { day: number; label: string; short: string }[] = [
  { day: 1, label: "Lunes", short: "Lun" },
  { day: 2, label: "Martes", short: "Mar" },
  { day: 3, label: "Miércoles", short: "Mié" },
  { day: 4, label: "Jueves", short: "Jue" },
  { day: 5, label: "Viernes", short: "Vie" },
  { day: 6, label: "Sábado", short: "Sáb" },
  { day: 0, label: "Domingo", short: "Dom" },
];
const DURATIONS = [30, 45, 50, 60].map((m) => ({ value: m, label: `${m} min` }));
const MEET_PREFIX = "https://meet.google.com/";

function firstName(name: string) {
  return name.split(" ")[0] || name;
}

function Section({ title, id, children, action }: { title: string; id: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={id} className="font-replica text-xl font-medium leading-[26px] text-foreground">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Requests({ requests, onNotice }: { requests: PracticeRequest[]; onNotice: (text: string) => void }) {
  const [declining, setDeclining] = useState<PracticeRequest | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const answer = async (request: PracticeRequest, accept: boolean) => {
    setBusy(request.id);
    const ok = await professional.answerRequest(request.id, accept);
    setBusy(null);
    const name = firstName(request.name);
    onNotice(
      !ok
        ? "No pudimos guardar tu respuesta. Puede que la solicitud ya no esté; la lista se actualizó."
        : accept
          ? `Aceptaste acompañar a ${name}. Ya pueden escribirse en Mensajes.`
          : `Le dijimos a ${name} que por ahora no puedes.`
    );
  };

  if (!requests.length) return <p className="text-[15px] text-muted-foreground">No tienes solicitudes nuevas.</p>;

  return (
    <>
      <ul className="space-y-3">
        {requests.map((r) => (
          <li key={r.id} className="space-y-3 rounded-lg border border-border/40 bg-surface-raised p-4 shadow-raised dark:shadow-none">
            <div className="flex items-center gap-3">
              <Avatar name={r.name} size={40} />
              <div className="min-w-0">
                <p className="break-words font-semibold text-foreground">{r.name}</p>
                <p className="text-[13px] text-muted-foreground">Te escribió el {dateLabel(r.createdAt)}</p>
              </div>
            </div>
            {r.message ? <p className="whitespace-pre-wrap rounded-md bg-surface px-4 py-3 text-[15px] leading-[21px] text-foreground">{r.message}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="h-11" onClick={() => void answer(r, true)} aria-busy={busy === r.id || undefined}>
                Aceptar
              </Button>
              <Button variant="secondary" size="sm" className="h-11" onClick={() => setDeclining(r)}>
                Ahora no
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={!!declining}
        onClose={() => setDeclining(null)}
        onConfirm={() => declining && void answer(declining, false)}
        title={declining ? `¿Responder "Ahora no" a ${firstName(declining.name)}?` : ""}
        description="Le diremos que por ahora no puedes y que puede buscar a otro psicólogo."
        confirmLabel="Ahora no"
      />
    </>
  );
}

function Patients({ practice }: { practice: Practice }) {
  const active = activePatients(practice);
  const ended = endedPatients(practice);
  const sessions = upcomingSessions(practice);
  const next = (p: Patient) => sessions.find((a) => a.conversationId === p.conversationId);

  const columns: Column<Patient>[] = [
    {
      key: "nombre",
      header: "Nombre",
      cell: (p) => (
        <span className="flex items-center gap-3">
          <Avatar name={p.name} photo={p.photo} size={32} />
          <span className="font-semibold">{p.name}</span>
        </span>
      ),
    },
    { key: "desde", header: "Desde", secondary: true, cell: (p) => <span className="whitespace-nowrap">{dateLabel(p.since)}</span> },
    { key: "diario", header: "Diario", cell: (p) => (p.sharing ? <span className="text-voice">Compartido</span> : <span className="text-muted-foreground">Privado</span>) },
    {
      key: "sesion",
      header: "Próxima sesión",
      cell: (p) => {
        const a = next(p);
        return a ? sessionLabel(a.startsAt) : <span className="text-muted-foreground">Sin agendar</span>;
      },
    },
    {
      key: "abrir",
      header: "Ficha",
      className: "text-right",
      cell: (p) => (
        <Link
          to={`/profesional/pacientes/${p.id}`}
          aria-label={`Abrir la ficha de ${p.name}`}
          className="inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-semibold text-voice hover:bg-voice-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
        >
          Abrir
        </Link>
      ),
    },
  ];

  const card = (p: Patient) => {
    const a = next(p);
    return (
      <Link
        to={`/profesional/pacientes/${p.id}`}
        className="flex items-center gap-3 rounded-lg border border-border/40 bg-surface-raised p-4 shadow-raised transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice dark:shadow-none"
      >
        <Avatar name={p.name} photo={p.photo} size={40} />
        <span className="min-w-0 flex-1">
          <span className="block break-words font-semibold text-foreground">{p.name}</span>
          <span className="block text-[13px] text-muted-foreground">
            {p.sharing ? "Diario compartido" : "Diario privado"} · {a ? sessionLabel(a.startsAt) : "Sin sesión agendada"}
          </span>
        </span>
      </Link>
    );
  };

  return (
    <div className="space-y-5">
      {active.length ? (
        <DataTable caption="Pacientes activos" columns={columns} rows={active} rowKey={(p) => p.id} card={card} />
      ) : (
        <EmptyState icon={Users} title="Todavía no acompañas a nadie.">
          Cuando aceptes una solicitud, la persona aparece aquí.
        </EmptyState>
      )}
      {ended.length ? (
        <div className="space-y-2">
          <h3 className="text-[13px] text-muted-foreground">Terminados</h3>
          <ul className="divide-y divide-border/40 rounded-lg border border-border/40 bg-surface-raised">
            {ended.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/profesional/pacientes/${p.id}`}
                  className="flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-0.5 px-4 py-3 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voice"
                >
                  <span className="break-words text-[15px] text-foreground">{p.name}</span>
                  <span className="text-[13px] text-muted-foreground">Terminó el {dateLabel(p.endedAt ?? p.since)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ScheduleForm({ practice, onNotice }: { practice: Practice; onNotice: (text: string) => void }) {
  const [link, setLink] = useState(practice.meetLink);
  const [availability, setAvailability] = useState<Availability>(practice.availability);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fromId = useId();
  const toId = useId();
  const linkValid = link.trim().startsWith(MEET_PREFIX) && link.trim().length > MEET_PREFIX.length;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!linkValid) {
      setError("Pega el enlace de tu sala de Google Meet. Empieza con https://meet.google.com/.");
      return;
    }
    if (!availability.days.length || availability.from >= availability.to) {
      setError(!availability.days.length ? "Elige al menos un día." : "La hora de fin va después de la de inicio.");
      return;
    }
    setError(null);
    setBusy(true);
    const ok = await professional.saveSchedule(link.trim(), availability);
    setBusy(false);
    onNotice(ok ? "Guardamos tu agenda." : "No pudimos guardar tu agenda. Revisa tu conexión e inténtalo otra vez.");
  };

  const copy = () => {
    navigator.clipboard.writeText(link.trim()).then(
      () => onNotice("Copiamos tu enlace de Meet."),
      () => onNotice("No pudimos copiarlo. Selecciónalo y cópialo a mano.")
    );
  };

  const time = "h-11 w-full rounded-md border border-border/70 bg-surface-raised px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice";

  return (
    <form noValidate onSubmit={save} className="space-y-5 rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised dark:shadow-none">
      <div className="space-y-2">
        <Field
          label="Tu enlace de Meet"
          type="url"
          inputMode="url"
          placeholder="https://meet.google.com/abc-defg-hij"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          error={error?.includes("Meet") ? error : null}
        />
        {linkValid ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" className="h-11" onClick={copy}>
              Copiar
            </Button>
            <a
              href={link.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-full px-4 text-xs font-semibold text-voice hover:bg-voice-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
            >
              Probar
            </a>
          </div>
        ) : null}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-[13px] text-muted-foreground">Días en que atiendes</legend>
        <div className="flex flex-wrap gap-2">
          {WEEK.map((d) => {
            const on = availability.days.includes(d.day);
            return (
              <label
                key={d.day}
                className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border px-3 text-sm transition-colors duration-small has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-voice ${
                  on ? "border-voice/50 bg-voice/10 text-voice" : "border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  aria-label={d.label}
                  onChange={() =>
                    setAvailability((a) => ({ ...a, days: on ? a.days.filter((x) => x !== d.day) : [...a.days, d.day].sort() }))
                  }
                />
                <span aria-hidden="true">{d.short}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor={fromId} className="text-[13px] text-muted-foreground">
            Desde
          </label>
          <input id={fromId} type="time" step={900} className={time} value={availability.from} onChange={(e) => setAvailability((a) => ({ ...a, from: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <label htmlFor={toId} className="text-[13px] text-muted-foreground">
            Hasta
          </label>
          <input id={toId} type="time" step={900} className={time} value={availability.to} onChange={(e) => setAvailability((a) => ({ ...a, to: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[13px] text-muted-foreground">
          Cuánto dura cada sesión
        </p>
        <Segmented label="Cuánto dura cada sesión" options={DURATIONS} value={availability.minutes} onChange={(minutes) => setAvailability((a) => ({ ...a, minutes }))} className="w-full max-w-[24rem]" />
      </div>

      {error && !error.includes("Meet") ? (
        <p role="alert" className="text-[13px] text-emotion">
          {error}
        </p>
      ) : null}
      <Button type="submit" aria-busy={busy || undefined}>
        {busy ? "Guardando…" : "Guardar agenda"}
      </Button>
    </form>
  );
}

function Sessions({ practice, onNotice }: { practice: Practice; onNotice: (text: string) => void }) {
  const sessions = upcomingSessions(practice);
  const active = activePatients(practice);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const patientFieldId = useId();
  const dayId = useId();
  const hourId = useId();
  const nameOf = (conversationId: string) => practice.patients.find((p) => p.conversationId === conversationId)?.name ?? "";

  const openScheduling = () => {
    setPatientId(active[0]?.id ?? "");
    setDay(inputDate(new Date(Date.now() + 86_400_000)));
    setHour(practice.availability.from);
    setError(null);
    setScheduling(true);
  };

  const schedule = async () => {
    const patient = active.find((p) => p.id === patientId);
    const startsAt = new Date(`${day}T${hour}`);
    if (!patient) return setError("Elige con quién es la sesión.");
    if (!day || !hour || Number.isNaN(startsAt.getTime())) return setError("Elige el día y la hora.");
    if (startsAt.getTime() <= Date.now()) return setError("Elige un momento que todavía no haya pasado.");
    setBusy(true);
    const ok = await professional.schedule(patient.conversationId, startsAt.toISOString());
    setBusy(false);
    if (!ok) return setError("No pudimos agendarla. Revisa tu conexión e inténtalo otra vez.");
    setScheduling(false);
    onNotice(`Agendaste una sesión con ${firstName(patient.name)}. La ve en su chat.`);
  };

  const field = "h-12 w-full rounded-md border border-border bg-surface px-4 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-voice/40";
  const agenda = describeSchedule(practice.availability);
  const outside = !!day && !!hour && !withinSchedule(practice.availability, day, hour);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] text-muted-foreground">Próximas sesiones</h3>
        {active.length ? (
          <Button variant="secondary" size="sm" className="h-11" onClick={openScheduling}>
            Agendar una sesión
          </Button>
        ) : null}
      </div>
      {sessions.length ? (
        <ul className="space-y-2">
          {sessions.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border/50 bg-surface-raised px-4 py-3">
              <Video size={18} className="shrink-0 text-voice" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block break-words text-[15px] font-semibold text-foreground">{nameOf(a.conversationId)}</span>
                <span className="block text-[13px] text-muted-foreground">
                  {sessionLabel(a.startsAt)} · {a.minutes} min
                </span>
              </span>
              <Button variant="ghost" size="sm" className="h-11" onClick={() => setCancelling(a.id)} aria-label={`Cancelar la sesión con ${nameOf(a.conversationId)}`}>
                Cancelar
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[15px] text-muted-foreground">No tienes sesiones agendadas.</p>
      )}

      <ConfirmDialog
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        onConfirm={() => {
          if (cancelling)
            void professional.cancelAppointment(cancelling).then((ok) => onNotice(ok ? "Cancelaste la sesión. Lo verá en su chat." : "No pudimos cancelarla. Inténtalo otra vez."));
        }}
        title="¿Cancelar esta sesión?"
        description="Le avisaremos en su chat. Si quieren, pueden agendar otra."
        confirmLabel="Cancelar la sesión"
        cancelLabel="Mantenerla"
      />

      <Dialog
        open={scheduling}
        onClose={() => setScheduling(false)}
        title="Agendar una sesión"
        description={practice.meetLink ? `Por Google Meet, de ${practice.availability.minutes} minutos.` : undefined}
        footer={
          practice.meetLink ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setScheduling(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={() => void schedule()} aria-busy={busy || undefined}>
                Agendar
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setScheduling(false)}>
              Entendido
            </Button>
          )
        }
      >
        {practice.meetLink ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor={patientFieldId} className="block text-[13px] text-muted-foreground">
                Paciente
              </label>
              <select id={patientFieldId} className={field} value={patientId} onChange={(e) => setPatientId(e.target.value)} data-autofocus>
                {active.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor={dayId} className="block text-[13px] text-muted-foreground">
                  Día
                </label>
                <input id={dayId} type="date" className={field} min={inputDate(new Date())} value={day} onChange={(e) => setDay(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor={hourId} className="block text-[13px] text-muted-foreground">
                  Hora
                </label>
                <input id={hourId} type="time" step={900} className={field} value={hour} onChange={(e) => setHour(e.target.value)} />
              </div>
            </div>
            <p role="status" className="text-[13px] text-muted-foreground">
              {outside ? `Está fuera de tu agenda (${agenda}). Puedes agendarla igual.` : `Tu agenda: ${agenda}.`}
            </p>
            {error ? (
              <p role="alert" className="text-[13px] text-emotion">
                {error}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-[15px] leading-[21px] text-foreground">Primero guarda tu enlace de Meet en tu agenda: es por donde se unen a la sesión.</p>
        )}
      </Dialog>
    </div>
  );
}

function Authorizations({ practice }: { practice: Practice }) {
  const events = shareEvents(practice);
  if (!events.length) return <p className="text-[13px] leading-[18px] text-muted-foreground">Cuando alguien te comparta su diario, o deje de hacerlo, aparece aquí.</p>;
  return (
    <ul className="space-y-3">
      {events.map(({ message, patient }) => (
        <li key={message.id} className="flex items-start gap-3">
          <NotebookText size={16} className={`mt-0.5 shrink-0 ${message.event === "share_on" ? "text-voice" : "text-muted-foreground"}`} aria-hidden="true" />
          <span className="min-w-0">
            <span className="block break-words text-[15px] leading-[21px] text-foreground">
              {message.event === "share_on" ? `${patient.name} te compartió su diario` : `${patient.name} dejó de compartirlo`}
            </span>
            <span className="block text-[13px] text-muted-foreground">{dateLabel(message.createdAt)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Panel del psicólogo (DESIGN-WEB.md §10): el resumen con números calculados de su consultorio, las
 * solicitudes, los pacientes, la agenda y quién le compartió su diario.
 */
export const Dashboard: React.FC = () => {
  const { practice } = useProfessional();
  const wide = useMediaQuery(DESKTOP);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void professional.loadPractice();
  }, []);

  const p = practice.value;
  let body: React.ReactNode;
  if (!p && practice.status === "error") {
    body = (
      <div className="space-y-3">
        <p role="alert" className="text-[15px] text-emotion">
          No pudimos traer tu consultorio. Revisa tu conexión e inténtalo otra vez.
        </p>
        <Button variant="secondary" onClick={() => void professional.loadPractice()}>
          Intentar de nuevo
        </Button>
      </div>
    );
  } else if (!p) {
    body = <Skeleton rows={4} shape="card" label="Cargando tu consultorio…" />;
  } else {
    const active = activePatients(p);
    const next = upcomingSessions(p)[0];
    body = (
      <div className="space-y-10">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricTile icon={Users} label="Pacientes activos" value={active.length} caption={active.length === 1 ? "persona" : "personas"} />
          <MetricTile icon={Inbox} tint="neutral" label="Solicitudes nuevas" value={p.requests.length} caption="sin responder" />
          <MetricTile icon={NotebookText} label="Diarios compartidos" value={active.filter((x) => x.sharing).length} caption={`de ${active.length}`} />
          <MetricTile icon={CalendarClock} tint="neutral" label="Próxima sesión" value={next ? new Date(next.startsAt).toLocaleDateString("es", { day: "numeric", month: "short" }) : "Sin sesiones"}
            caption={next ? `${timeLabel(next.startsAt)} · ${firstName(p.patients.find((x) => x.conversationId === next.conversationId)?.name ?? "")}` : "agendadas"} />
        </div>

        <Section title="Solicitudes" id="dash-solicitudes">
          <Requests requests={p.requests} onNotice={setNotice} />
        </Section>

        <Section title="Pacientes" id="dash-pacientes">
          <Patients practice={p} />
        </Section>

        <Section title="Agenda" id="dash-agenda">
          <ScheduleForm practice={p} onNotice={setNotice} />
          <Sessions practice={p} onNotice={setNotice} />
        </Section>

        {!wide ? (
          <Section title="Autorizaciones de lectura" id="dash-autorizaciones">
            <Authorizations practice={p} />
          </Section>
        ) : null}
      </div>
    );
  }

  return (
    <ProfessionalPage
      title={p ? `Hola, ${firstName(p.name)}` : "Panel"}
      description="Tus pacientes, tus solicitudes y tu agenda."
      panelTitle="Autorizaciones de lectura"
      panel={wide && p ? <div className="mt-4">{<Authorizations practice={p} />}</div> : undefined}
    >
      <p role="status" className={notice ? "rounded-md bg-surface px-4 py-3 text-[15px] text-foreground" : "sr-only"}>
        {notice}
      </p>
      {body}
    </ProfessionalPage>
  );
};

export default Dashboard;
