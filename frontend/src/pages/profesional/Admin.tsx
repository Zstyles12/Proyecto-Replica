import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Inbox, SlidersHorizontal } from "lucide-react";
import { ProfessionalPage } from "../../components/layout/ProfessionalPage";
import { Button } from "../../components/ui/Button";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { DateRangeFilter } from "../../components/ui/DateRangeFilter";
import { inRange, type DateRange } from "../../components/ui/dateRange";
import { Dialog } from "../../components/ui/Dialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { Field } from "../../components/ui/Field";
import { PdfPreview } from "../../components/ui/PdfPreview";
import { Skeleton } from "../../components/ui/Skeleton";
import { StatusPill } from "../../components/ui/StatusPill";
import { professional, useProfessional } from "../../features/professional/store";
import { DESKTOP, TABLET, useMediaQuery } from "../../hooks/useMediaQuery";
import { dateLabel, dayKey } from "../../lib/format";
import { professionalService, type Application, type ApplicationStatus, type ReviewAction, type VerificationDocument } from "../../services/professional";

type StatusFilter = ApplicationStatus | "all";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "Pendientes" },
  { value: "needs_changes", label: "Por corregir" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
  { value: "all", label: "Todas" },
];

const ACTION_LABEL: Record<ReviewAction, string> = {
  approved: "Aprobada",
  needs_changes: "Pidió una corrección",
  rejected: "Rechazada",
};

function firstName(name: string) {
  return name.split(" ")[0] || name;
}

function DocumentPreview({ document }: { document: VerificationDocument }) {
  const load = useCallback(() => professionalService.documentUrl(document), [document]);
  return <PdfPreview name={document.name} sizeBytes={document.sizeBytes} load={load} />;
}

// Lo que se puede decidir sobre una solicitud pendiente, cada cosa con su ventana.
function Decisions({ application, onDone }: { application: Application; onDone: (text: string) => void }) {
  const [open, setOpen] = useState<ReviewAction | null>(null);
  const [reason, setReason] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const name = firstName(application.fullName);
  const current = application.documents.filter((d) => !d.replaced);

  const close = () => {
    setOpen(null);
    setReason("");
    setDocuments([]);
    setError(null);
    setFailed(false);
  };

  const decide = async (action: ReviewAction) => {
    if (busy) return;
    if (action !== "approved" && reason.trim().length < 3) {
      setError(action === "rejected" ? "Escribe el motivo: es lo que va a leer." : "Escribe qué hay que corregir: es lo que va a leer.");
      return;
    }
    setBusy(true);
    const ok = await professional.review(application.id, action, reason.trim(), action === "needs_changes" ? documents : []);
    setBusy(false);
    if (!ok) {
      setFailed(true);
      return;
    }
    close();
    onDone(
      action === "approved"
        ? `Aprobaste a ${name}. Ya aparece en el directorio.`
        : action === "needs_changes"
          ? `Le pediste a ${name} que corrija su solicitud.`
          : `Rechazaste la solicitud de ${name}.`
    );
  };

  const failure = failed ? (
    <p role="alert" className="text-[13px] text-emotion">
      No pudimos guardar tu decisión. Puede que otra persona ya la haya revisado; la lista se actualizó.
    </p>
  ) : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpen("approved")}>Aprobar</Button>
        <Button variant="secondary" onClick={() => setOpen("needs_changes")}>
          Solicitar subsanación
        </Button>
        <Button variant="ghost" className="!text-destructive" onClick={() => setOpen("rejected")}>
          Rechazar
        </Button>
      </div>

      <Dialog
        open={open === "approved"}
        onClose={close}
        size="sm"
        title={`¿Aprobar a ${name}?`}
        description="Pasa a ser psicólogo verificado: aparece en el directorio y se abre su panel profesional."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={close}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => void decide("approved")} aria-busy={busy || undefined}>
              Aprobar
            </Button>
          </>
        }
      >
        {failure}
      </Dialog>

      <Dialog
        open={open === "needs_changes"}
        onClose={close}
        title="Solicitar subsanación"
        description={`${name} verá lo que escribas y podrá corregir su solicitud.`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={close}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => void decide("needs_changes")} aria-busy={busy || undefined}>
              Pedir la corrección
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {current.length ? (
            <fieldset className="space-y-1">
              <legend className="pb-1 text-[13px] text-muted-foreground">Documentos</legend>
              {current.map((d) => (
                <label key={d.id} className="flex min-h-11 cursor-pointer items-start gap-3 py-1.5 text-[15px] leading-[21px] text-foreground">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--voice)]"
                    checked={documents.includes(d.id)}
                    onChange={(e) => setDocuments((list) => (e.target.checked ? [...list, d.id] : list.filter((x) => x !== d.id)))}
                  />
                  <span className="min-w-0 break-words">Pedir que reemplace {d.name}</span>
                </label>
              ))}
            </fieldset>
          ) : null}
          <Field
            label="Qué hay que corregir"
            multiline
            maxLength={1000}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            error={error}
            data-autofocus
          />
          {failure}
        </div>
      </Dialog>

      <Dialog
        open={open === "rejected"}
        onClose={close}
        title={`Rechazar la solicitud de ${name}`}
        description={`${name} verá el motivo y podrá enviar otra solicitud más adelante.`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={close}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={() => void decide("rejected")} aria-busy={busy || undefined}>
              Rechazar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label="Motivo"
            multiline
            maxLength={1000}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            error={error}
            data-autofocus
          />
          {failure}
        </div>
      </Dialog>
    </div>
  );
}

// El expediente de una solicitud: sus datos, sus documentos, lo que se puede decidir y su historial.
function Expediente({ application, onDone }: { application: Application; onDone: (text: string) => void }) {
  const current = application.documents.filter((d) => !d.replaced);
  const replaced = application.documents.filter((d) => d.replaced);
  const rows: [string, string][] = [
    ["Cómo se presenta", application.title],
    ["Cédula o colegiatura", application.license],
    ["Universidad", application.university],
    ["Años de experiencia", String(application.years ?? 0)],
    ["Especialidades", application.specialties.join(" · ")],
    ["Enfoque", application.approach],
    ["Enviada", dateLabel(application.submittedAt)],
  ];
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="font-replica text-2xl leading-[30px] text-foreground">{application.fullName}</p>
        <StatusPill status={application.status} />
      </div>

      {application.status === "pending" ? (
        <Decisions application={application} onDone={onDone} />
      ) : application.status === "needs_changes" ? (
        <p className="rounded-md bg-surface px-4 py-3 text-[15px] leading-[21px] text-foreground">Esperando que {firstName(application.fullName)} corrija.</p>
      ) : null}

      <dl className="divide-y divide-border/40">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className="space-y-0.5 py-2.5">
              <dt className="text-[13px] text-muted-foreground">{label}</dt>
              <dd className="break-words text-[15px] text-foreground">{value}</dd>
            </div>
          ))}
      </dl>
      {application.bio ? (
        <div className="space-y-1">
          <h3 className="text-[13px] text-muted-foreground">Sobre su práctica</h3>
          <p className="whitespace-pre-wrap text-[15px] leading-[21px] text-foreground">{application.bio}</p>
        </div>
      ) : null}

      <section className="space-y-3" aria-labelledby="expediente-documentos">
        <h3 id="expediente-documentos" className="font-replica text-lg font-medium text-foreground">
          Documentos
        </h3>
        {current.map((d) => (
          <DocumentPreview key={d.id} document={d} />
        ))}
        {replaced.length ? (
          <div className="space-y-1.5">
            <p className="text-[13px] text-muted-foreground">Reemplazados</p>
            <ul className="space-y-1">
              {replaced.map((d) => (
                <li key={d.id} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <FileText size={14} aria-hidden="true" />
                  <span className="break-words">
                    {d.name} · {dateLabel(d.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="space-y-3" aria-labelledby="expediente-historial">
        <h3 id="expediente-historial" className="font-replica text-lg font-medium text-foreground">
          Historial
        </h3>
        <ol className="space-y-3">
          {application.reviews.map((r) => (
            <li key={r.id} className="space-y-1 border-l-2 border-border/60 pl-3">
              <p className="text-[15px] font-semibold text-foreground">
                {ACTION_LABEL[r.action]} <span className="font-normal text-muted-foreground">· {dateLabel(r.createdAt)}</span>
              </p>
              {r.reason ? <p className="whitespace-pre-wrap text-[13px] leading-[18px] text-muted-foreground">{r.reason}</p> : null}
            </li>
          ))}
          <li className="space-y-1 border-l-2 border-border/60 pl-3">
            <p className="text-[15px] font-semibold text-foreground">
              Enviada <span className="font-normal text-muted-foreground">· {dateLabel(application.submittedAt)}</span>
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}

/**
 * Panel de administración (DESIGN-WEB.md §10): las solicitudes de verificación, sus filtros y el
 * expediente de cada una. El expediente vive en la dirección (`?solicitud=:id`), así se puede enlazar y
 * el atrás del navegador lo cierra. Lo que se decide lo guarda el servidor (`set-role`).
 */
export const Admin: React.FC = () => {
  const { applications } = useProfessional();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const wide = useMediaQuery(DESKTOP);
  const tablet = useMediaQuery(TABLET);
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<DateRange>({ from: "", to: "" });
  const [newestFirst, setNewestFirst] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void professional.loadApplications();
  }, []);

  const selectedId = params.get("solicitud");
  const selected = applications.value.find((a) => a.id === selectedId) ?? null;

  const open = (id: string) => {
    setNotice(null);
    setParams({ solicitud: id }, { replace: !!selectedId, state: { fromList: true } });
  };
  // Si se abrió desde la lista, cerrar es volver atrás; si llegó con el enlace, se quita de la dirección.
  const close = () => {
    if ((location.state as { fromList?: boolean } | null)?.fromList) navigate(-1);
    else setParams({}, { replace: true });
  };

  const rows = useMemo(() => {
    const text = query.trim().toLocaleLowerCase("es");
    return applications.value
      .filter((a) => status === "all" || a.status === status)
      .filter((a) => !text || a.fullName.toLocaleLowerCase("es").includes(text) || a.license.toLocaleLowerCase("es").includes(text))
      .filter((a) => inRange(dayKey(new Date(a.submittedAt)), range))
      .sort((a, b) => (newestFirst ? b.submittedAt.localeCompare(a.submittedAt) : a.submittedAt.localeCompare(b.submittedAt)));
  }, [applications.value, status, query, range, newestFirst]);

  const columns: Column<Application>[] = [
    { key: "nombre", header: "Nombre", cell: (a) => <span className="font-semibold">{a.fullName}</span> },
    { key: "cedula", header: "Cédula", cell: (a) => a.license },
    { key: "universidad", header: "Universidad", secondary: true, cell: (a) => a.university },
    {
      key: "enviada",
      header: "Enviada",
      sort: newestFirst ? "descending" : "ascending",
      onSort: () => setNewestFirst((x) => !x),
      cell: (a) => <span className="whitespace-nowrap">{dateLabel(a.submittedAt)}</span>,
    },
    { key: "estado", header: "Estado", cell: (a) => <StatusPill status={a.status} /> },
    {
      key: "accion",
      header: "Acción",
      className: "text-right",
      cell: (a) => (
        <Button variant="ghost" size="sm" className="h-11" onClick={() => open(a.id)} aria-label={`Revisar la solicitud de ${a.fullName}`}>
          Revisar
        </Button>
      ),
    },
  ];

  const card = (a: Application) => (
    <button
      type="button"
      onClick={() => open(a.id)}
      className="w-full space-y-2 rounded-lg border border-border/40 bg-surface-raised p-4 text-left shadow-raised transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice dark:shadow-none"
    >
      <span className="flex flex-wrap items-start justify-between gap-2">
        <span className="min-w-0 break-words font-semibold text-foreground">{a.fullName}</span>
        <StatusPill status={a.status} />
      </span>
      <span className="block break-words text-[13px] text-muted-foreground">
        {a.license} · {a.university}
      </span>
      <span className="block text-[13px] text-muted-foreground">Enviada el {dateLabel(a.submittedAt)}</span>
      <span className="sr-only">Revisar</span>
    </button>
  );

  const filters = (
    <div className="space-y-4">
      {/* Cinco estados no caben en una fila en todos los anchos: van en pastillas que bajan de línea. */}
      <div role="radiogroup" aria-label="Estado" className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={status === o.value}
            onClick={() => setStatus(o.value)}
            className={`min-h-11 rounded-full border px-4 text-[13px] transition-colors duration-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
              status === o.value ? "border-voice/50 bg-voice/10 text-voice" : "border-border/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <Field label="Buscar por nombre o cédula" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      <DateRangeFilter value={range} onChange={setRange} className="max-w-md" />
    </div>
  );

  let list: React.ReactNode;
  if (applications.status === "idle" || (applications.status === "loading" && !applications.value.length)) {
    list = <Skeleton rows={4} shape={wide ? "row" : "card"} label="Cargando las solicitudes…" />;
  } else if (applications.status === "error" && !applications.value.length) {
    list = (
      <div className="space-y-3">
        <p role="alert" className="text-[15px] text-emotion">
          No pudimos traer las solicitudes. Revisa tu conexión e inténtalo otra vez.
        </p>
        <Button variant="secondary" onClick={() => void professional.loadApplications()}>
          Intentar de nuevo
        </Button>
      </div>
    );
  } else if (!rows.length) {
    list = (
      <EmptyState icon={Inbox} title={status === "pending" && !query && !range.from && !range.to ? "No hay solicitudes pendientes." : "Nada coincide con estos filtros."}>
        {status === "pending" ? "Cuando alguien envíe la suya, aparece aquí." : "Prueba con otro estado o con otras fechas."}
      </EmptyState>
    );
  } else {
    list = <DataTable caption="Solicitudes de verificación" columns={columns} rows={rows} rowKey={(a) => a.id} card={card} selected={selectedId} />;
  }

  const done = (text: string) => setNotice(text);
  const expediente = selected ? <Expediente key={selected.id} application={selected} onDone={done} /> : null;

  return (
    <ProfessionalPage
      title="Solicitudes de verificación"
      description="Revisa los datos y los documentos antes de aprobar un perfil. Lo que decidas queda en el historial."
      panelTitle="Expediente profesional"
      panel={
        wide ? (
          <div className="mt-4">
            {expediente ?? <p className="text-[13px] leading-[18px] text-muted-foreground">Elige una solicitud para ver su expediente.</p>}
          </div>
        ) : undefined
      }
    >
      {/* Siempre en la página, para que el lector de pantalla diga lo que cambie. */}
      <p role="status" className={notice ? "rounded-md bg-surface px-4 py-3 text-[15px] text-foreground" : "sr-only"}>
        {notice}
      </p>

      {tablet ? (
        filters
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-muted-foreground">{STATUS_OPTIONS.find((o) => o.value === status)?.label}</p>
          <Button variant="secondary" size="sm" className="h-11" icon={<SlidersHorizontal size={16} aria-hidden="true" />} onClick={() => setFiltersOpen(true)}>
            Filtrar
          </Button>
        </div>
      )}

      {list}

      {!tablet ? (
        <Dialog
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          title="Filtrar"
          footer={
            <Button size="sm" onClick={() => setFiltersOpen(false)}>
              Ver {rows.length === 1 ? "1 solicitud" : `${rows.length} solicitudes`}
            </Button>
          }
        >
          {filters}
        </Dialog>
      ) : null}

      {!wide ? (
        <Dialog variant="side" open={!!selected} onClose={close} title="Expediente profesional" closeLabel="Cerrar el expediente">
          {expediente}
        </Dialog>
      ) : null}
    </ProfessionalPage>
  );
};

export default Admin;
