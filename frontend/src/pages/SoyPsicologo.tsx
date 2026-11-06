import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Enter } from "../components/motion/Motion";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { FileDropzone } from "../components/ui/FileDropzone";
import { Skeleton } from "../components/ui/Skeleton";
import { StatusPill } from "../components/ui/StatusPill";
import { SpecialtyPicker } from "../features/professional/components/SpecialtyPicker";
import { professional, useProfessional } from "../features/professional/store";
import { useUploads } from "../features/professional/uploads";
import { dateLabel, fileSize } from "../lib/format";
import { sessionActions, useRole } from "../lib/session";
import {
  ETHICS_VERSION,
  MAX_DOCUMENTS,
  professionalService,
  type Application,
  type ApplicationForm,
  type VerificationDocument,
} from "../services/professional";

const EMPTY_FORM: ApplicationForm = { fullName: "", title: "", license: "", university: "", specialties: [], approach: "", years: null, bio: "" };
const BIO_MAX = 280;

type Errors = Partial<Record<"fullName" | "title" | "license" | "university" | "years" | "specialties" | "documents" | "ethics", string>>;

// Abre un documento en otra pestaña. La pestaña se abre al tocar, antes de pedir el enlace: si se abre
// después, el navegador la bloquea.
function openDocument(document: VerificationDocument) {
  const tab = window.open("", "_blank");
  if (tab) tab.opener = null;
  professionalService.documentUrl(document).then(
    (url) => {
      if (tab) tab.location.href = url;
    },
    () => tab?.close()
  );
}

function DocumentList({ documents }: { documents: VerificationDocument[] }) {
  return (
    <ul className="space-y-2">
      {documents.map((d) => (
        <li key={d.id} className="flex items-center gap-3 rounded-md border border-border/50 bg-surface-raised px-3 py-2">
          <FileText size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block break-words text-[15px] text-foreground">{d.name}</span>
            <span className="block text-xs text-muted-foreground">{fileSize(d.sizeBytes)}</span>
          </span>
          <Button variant="ghost" size="sm" className="h-11" onClick={() => openDocument(d)} aria-label={`Abrir ${d.name}`}>
            Abrir
          </Button>
        </li>
      ))}
    </ul>
  );
}

function Summary({ application }: { application: Application }) {
  const rows: [string, string][] = [
    ["Nombre", application.fullName],
    ["Cómo te presentas", application.title],
    ["Cédula o colegiatura", application.license],
    ["Universidad", application.university],
    ["Años de experiencia", String(application.years ?? 0)],
    ["Especialidades", application.specialties.join(" · ")],
  ];
  return (
    <div className="space-y-4">
      <dl className="divide-y divide-border/40 rounded-lg border border-border/40 bg-surface-raised px-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-4">
            <dt className="text-[13px] text-muted-foreground sm:w-44 sm:shrink-0">{label}</dt>
            <dd className="break-words text-[15px] text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="space-y-2">
        <h2 className="text-[13px] text-muted-foreground">Documentos</h2>
        <DocumentList documents={application.documents.filter((d) => !d.replaced)} />
      </div>
    </div>
  );
}

function Explainer() {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="font-replica text-xl font-medium leading-[26px] text-foreground">Cómo es la verificación</h2>
        <ol className="space-y-3 text-[15px] leading-[21px] text-muted-foreground">
          <li className="flex gap-3">
            <span className="font-replica text-lg leading-[21px] text-voice">1</span>Envías tus datos y tus documentos.
          </li>
          <li className="flex gap-3">
            <span className="font-replica text-lg leading-[21px] text-voice">2</span>El equipo de Replica los revisa. Si falta algo, te lo pide aquí.
          </li>
          <li className="flex gap-3">
            <span className="font-replica text-lg leading-[21px] text-voice">3</span>Con tu perfil aprobado, apareces en el directorio y se abre tu panel profesional.
          </li>
        </ol>
      </section>
      <section className="space-y-2">
        <h2 className="font-replica text-xl font-medium leading-[26px] text-foreground">Quién ve tus documentos</h2>
        <p className="text-[15px] leading-[21px] text-muted-foreground">
          Solo tú y el equipo de administración de Replica. Se guardan en un espacio privado y se abren con enlaces que vencen.
        </p>
      </section>
    </div>
  );
}

function ApplicationFormView({ application, onSent }: { application: Application | null; onSent: () => void }) {
  const correcting = application?.status === "needs_changes";
  const fresh = !application || application.status === "rejected" || application.status === "revoked";
  // Por corregir: lo que pidió reemplazar la última revisión. Lo demás se queda.
  const lastReview = application?.reviews[0];
  const toReplace = correcting ? (application?.documents ?? []).filter((d) => !d.replaced && lastReview?.documentIds.includes(d.id)) : [];
  const kept = correcting ? (application?.documents ?? []).filter((d) => !d.replaced && !toReplace.includes(d)) : [];

  const [form, setForm] = useState<ApplicationForm>(() => (application ? { ...application } : EMPTY_FORM));
  const [ethics, setEthics] = useState({ code: false, privacy: false });
  // Después del primer intento, cada campo dice lo que le falta mientras se corrige.
  const [attempted, setAttempted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const uploads = useUploads(MAX_DOCUMENTS - kept.length);
  const formRef = useRef<HTMLFormElement>(null);
  const set = (patch: Partial<ApplicationForm>) => setForm((f) => ({ ...f, ...patch }));

  const validate = (): Errors => {
    const e: Errors = {};
    if (form.fullName.trim().length < 3) e.fullName = "Escribe tu nombre completo.";
    if (form.title.trim().length < 3) e.title = "Cuéntanos cómo te presentas, por ejemplo «Psicóloga clínica».";
    if (form.license.trim().length < 3) e.license = "Falta tu cédula profesional o tu número de colegiatura.";
    if (form.university.trim().length < 2) e.university = "Falta la universidad donde te titulaste.";
    if (form.years === null || form.years < 0 || form.years > 70) e.years = "Escribe tus años de experiencia. Puede ser 0.";
    if (!form.specialties.length) e.specialties = "Elige al menos una especialidad.";
    if (uploads.uploading) e.documents = "Espera a que terminen de subir tus documentos.";
    else if (toReplace.length && !uploads.uploaded.length) e.documents = `Sube el documento que reemplaza a ${toReplace.map((d) => d.name).join(" y ")}.`;
    else if (!kept.length && !uploads.uploaded.length) e.documents = "Agrega tu título y tu constancia de colegiatura, en PDF.";
    if (!ethics.code || !ethics.privacy) e.ethics = "Para enviar tu solicitud, acepta los dos compromisos.";
    return e;
  };

  const errors = attempted ? validate() : {};

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    const found = validate();
    setAttempted(true);
    setFailed(false);
    if (Object.keys(found).length) {
      // El foco va al primer campo que falta, que ya dice qué le falta.
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setSending(true);
    const ok = await professional.submitApplication(
      { ...form, fullName: form.fullName.trim(), title: form.title.trim(), license: form.license.trim(), university: form.university.trim() },
      ETHICS_VERSION,
      uploads.uploaded,
      toReplace.map((d) => d.id)
    );
    setSending(false);
    if (!ok) {
      setFailed(true);
      return;
    }
    uploads.reset();
    onSent();
  };

  return (
    <form ref={formRef} noValidate className="space-y-5" onSubmit={submit}>
      <Field label="Nombre completo" value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} autoComplete="name" error={errors.fullName} maxLength={120} />
      <Field
        label="Cómo te presentas"
        hint="Así aparece bajo tu nombre en el directorio."
        placeholder="Psicóloga clínica"
        value={form.title}
        onChange={(e) => set({ title: e.target.value })}
        error={errors.title}
        maxLength={80}
      />
      <Field
        label="Cédula profesional o número de colegiatura"
        hint="Lo revisamos antes de que tu perfil aparezca en el directorio."
        value={form.license}
        onChange={(e) => set({ license: e.target.value })}
        error={errors.license}
        maxLength={60}
      />
      <Field label="Universidad" value={form.university} onChange={(e) => set({ university: e.target.value })} error={errors.university} maxLength={120} />
      <Field
        label="Años de experiencia"
        type="number"
        inputMode="numeric"
        min={0}
        max={70}
        value={form.years ?? ""}
        onChange={(e) => set({ years: e.target.value === "" ? null : Number(e.target.value) })}
        error={errors.years}
      />
      <SpecialtyPicker value={form.specialties} onChange={(specialties) => set({ specialties })} error={errors.specialties} errorId="especialidades-error" />
      <Field label="Enfoque (opcional)" placeholder="Terapia cognitivo-conductual" value={form.approach} onChange={(e) => set({ approach: e.target.value })} maxLength={120} />
      <Field
        label="Sobre ti (opcional)"
        multiline
        maxLength={BIO_MAX}
        count={{ value: form.bio.length, max: BIO_MAX }}
        value={form.bio}
        onChange={(e) => set({ bio: e.target.value })}
      />

      <div className="space-y-3">
        {toReplace.length ? (
          <div className="space-y-2">
            <p className="text-[13px] text-muted-foreground">Por reemplazar</p>
            <ul className="space-y-1">
              {toReplace.map((d) => (
                <li key={d.id} className="flex items-center gap-2 text-[15px] text-foreground">
                  <FileText size={16} className="text-emotion" aria-hidden="true" />
                  <span className="break-words">{d.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {kept.length ? (
          <div className="space-y-2">
            <p className="text-[13px] text-muted-foreground">Se quedan como están</p>
            <DocumentList documents={kept} />
          </div>
        ) : null}
        <FileDropzone
          label={toReplace.length ? "Los documentos nuevos" : "Tu título y tu constancia de colegiatura"}
          hint={`Hasta ${MAX_DOCUMENTS} PDF de 10 MB como máximo cada uno.`}
          items={uploads.items}
          onAdd={uploads.add}
          onRemove={uploads.remove}
          error={errors.documents ?? uploads.error}
        />
        {fresh && application ? (
          <p className="text-[13px] text-muted-foreground">Una solicitud nueva lleva sus documentos de nuevo.</p>
        ) : null}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-[13px] text-muted-foreground">Tus compromisos</legend>
        {(
          [
            ["code", "Me comprometo con el código de ética de mi profesión."],
            ["privacy", "Guardaré la confidencialidad de lo que me compartan mis pacientes."],
          ] as const
        ).map(([key, text]) => (
          <label key={key} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md py-2 text-[15px] leading-[21px] text-foreground">
            <input
              type="checkbox"
              checked={ethics[key]}
              onChange={(e) => setEthics((x) => ({ ...x, [key]: e.target.checked }))}
              aria-invalid={(!!errors.ethics && !ethics[key]) || undefined}
              aria-describedby={errors.ethics ? "compromisos-error" : undefined}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--voice)]"
            />
            {text}
          </label>
        ))}
        {errors.ethics ? (
          <p id="compromisos-error" role="alert" className="text-[13px] text-emotion">
            {errors.ethics}
          </p>
        ) : null}
      </fieldset>

      {failed ? (
        <p role="alert" className="text-[13px] text-emotion">
          No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo otra vez.
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" aria-busy={sending || undefined}>
        {sending ? "Enviando…" : correcting ? "Enviar de nuevo" : "Enviar para verificación"}
      </Button>
    </form>
  );
}

/**
 * Soy psicólogo o psicóloga (DESIGN-WEB.md §10): la solicitud de verificación y sus cinco estados. La
 * revisa un administrador; el servidor decide qué se puede enviar y cuándo.
 */
export const SoyPsicologo: React.FC = () => {
  const { application } = useProfessional();
  const role = useRole();
  const [editing, setEditing] = useState(false);
  const app = application.value;

  useEffect(() => {
    void professional.loadApplication();
  }, []);

  // Lo aprobaron con la sesión abierta: el rol nuevo llega sin salir.
  useEffect(() => {
    if (app?.status === "approved" && role === "user") professionalService.myRole().then(sessionActions.setRole, () => {});
  }, [app?.status, role]);

  const showForm = application.status === "ready" && (!app || app.status === "needs_changes" || ((app.status === "rejected" || app.status === "revoked") && editing));

  let body: React.ReactNode;
  if (application.status === "idle" || application.status === "loading") {
    body = <Skeleton rows={4} label="Cargando tu solicitud…" />;
  } else if (application.status === "error") {
    body = (
      <div className="space-y-4">
        <p role="alert" className="text-[15px] text-emotion">
          No pudimos traer tu solicitud. Revisa tu conexión e inténtalo otra vez.
        </p>
        <Button variant="secondary" onClick={() => void professional.loadApplication()}>
          Intentar de nuevo
        </Button>
      </div>
    );
  } else if (showForm) {
    body = (
      <div className="space-y-5">
        {app?.status === "needs_changes" ? (
          <div className="space-y-3">
            <StatusPill status="needs_changes" />
            <p className="text-[15px] leading-[21px] text-foreground">Hay algo que corregir antes de aprobar tu perfil.</p>
            {app.statusReason ? (
              <blockquote className="rounded-md bg-surface px-4 py-3 text-[15px] leading-[21px] text-foreground">{app.statusReason}</blockquote>
            ) : null}
          </div>
        ) : null}
        <ApplicationFormView application={app} onSent={() => setEditing(false)} />
      </div>
    );
  } else if (app?.status === "pending") {
    body = (
      <div className="space-y-5">
        <div className="space-y-2">
          <StatusPill status="pending" />
          <p className="text-[15px] leading-[21px] text-foreground" role="status">
            Recibimos tu solicitud el {dateLabel(app.submittedAt)}. Te avisamos aquí cuando la revisemos.
          </p>
        </div>
        <Summary application={app} />
      </div>
    );
  } else if (app?.status === "rejected" || app?.status === "revoked") {
    body = (
      <div className="space-y-4">
        <StatusPill status={app.status} />
        <p className="text-[15px] leading-[21px] text-foreground">
          {app.status === "revoked" ? "Retiramos tu verificación." : "No pudimos aprobar tu solicitud."}
        </p>
        {app.statusReason ? (
          <blockquote className="rounded-md bg-surface px-4 py-3 text-[15px] leading-[21px] text-foreground">{app.statusReason}</blockquote>
        ) : null}
        <Button onClick={() => setEditing(true)}>Enviar otra solicitud</Button>
      </div>
    );
  } else if (app?.status === "approved") {
    body = (
      <div className="space-y-5">
        <div className="space-y-3">
          <StatusPill status="approved" />
          <p className="text-[15px] leading-[21px] text-foreground">Tu perfil está en el directorio.</p>
          <Link
            to="/profesional/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full bg-voice px-6 text-[15px] font-semibold text-voice-foreground hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2"
          >
            Ir a mi panel profesional
          </Link>
        </div>
        <Summary application={app} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[680px] pb-8 lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-[minmax(0,680px)_320px] lg:items-start lg:gap-10">
      <div className="space-y-6">
        <PageHeader title="" fallback="/usuario" />
        <Enter className="space-y-2">
          <h1 className="font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground">Atiende en Replica</h1>
          <p className="text-[15px] leading-[21px] text-muted-foreground">
            Chatea con tus pacientes, coordina sesiones por Google Meet y, si te lo permiten, lee su diario entre sesiones.
          </p>
        </Enter>
        <Enter index={1}>{body}</Enter>
        <div className="border-t border-border/40 pt-6 lg:hidden">
          <Explainer />
        </div>
      </div>
      <aside className="hidden lg:sticky lg:top-8 lg:mt-12 lg:block" aria-label="Sobre la verificación">
        <div className="rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised dark:shadow-none">
          <Explainer />
        </div>
      </aside>
    </div>
  );
};

export default SoyPsicologo;
