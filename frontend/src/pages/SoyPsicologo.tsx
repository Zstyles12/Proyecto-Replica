import React, { useId, useState } from "react";
import { BadgeCheck, Hourglass } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Enter } from "../components/motion/Motion";
import { Button } from "../components/ui/Button";
import { PSYCHOLOGISTS } from "../features/care/data";
import { updateProfile, useProfile, type PsychologistApplication } from "../features/profile/store";
import { TEST_TOOLS } from "../lib/session";

const SPECIALTIES = [...new Set(PSYCHOLOGISTS.flatMap((p) => p.specialties))].sort();
const MEET = /^https:\/\/meet\.google\.com\/\S+$/;

function Field({
  label,
  hint,
  multiline,
  ...props
}: { label: string; hint?: string; multiline?: boolean } & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const hintId = useId();
  const className =
    "w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-voice/40";
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] text-muted-foreground">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} aria-describedby={hint ? hintId : undefined} rows={4} className={`${className} resize-none`} {...props} />
      ) : (
        <input id={id} aria-describedby={hint ? hintId : undefined} className={`${className} min-h-12`} {...props} />
      )}
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// Soy psicólogo o psicóloga (app/(tabs)/usuario/psicologo.tsx): registro profesional y estado de la
// verificación. Mientras no hay backend, la solicitud queda en revisión en este navegador.
export const SoyPsicologo: React.FC = () => {
  const profile = useProfile();
  const application = profile.psychologist;
  const [form, setForm] = useState<PsychologistApplication>(application);
  const set = (patch: Partial<PsychologistApplication>) => setForm((f) => ({ ...f, ...patch }));
  const complete =
    form.fullName.trim().length > 3 && form.license.trim().length > 2 && form.specialties.length > 0 && MEET.test(form.meetLink.trim());
  const verified = application.status === "verified";

  return (
    <div className="mx-auto max-w-[680px] space-y-6 pb-8 lg:mx-0">
      <PageHeader title="" fallback="/usuario" />
      <Enter className="space-y-2">
        <h1 className="font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground">Atiende en Replica</h1>
        <p className="text-[15px] leading-[21px] text-muted-foreground">
          Chatea con tus pacientes, coordina sesiones por Google Meet y, si te lo permiten, lee su diario entre sesiones.
        </p>
      </Enter>

      {application.status !== "none" ? (
        <Enter index={1} className="space-y-3">
          <div className="space-y-2 rounded-lg bg-surface p-5">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              {verified ? <BadgeCheck size={20} className="text-voice" aria-hidden="true" /> : <Hourglass size={20} className="text-voice" aria-hidden="true" />}
              {verified ? "Tu licencia está verificada" : "Estamos verificando tu licencia"}
            </p>
            <p className="text-[15px] leading-[21px] text-muted-foreground">
              {verified
                ? "Tu perfil aparece en el directorio y los usuarios pueden escribirte."
                : `Revisamos la licencia ${application.license} de ${application.fullName}. Te avisaremos cuando tu perfil esté visible en el directorio.`}
            </p>
          </div>
          {TEST_TOOLS && application.status === "review" ? (
            <Button variant="ghost" size="sm" onClick={() => updateProfile({ psychologist: { ...application, status: "verified" } })}>
              Simular aprobación (desarrollo)
            </Button>
          ) : null}
          {TEST_TOOLS ? (
            <Button variant="ghost" size="sm" onClick={() => updateProfile({ psychologist: { ...application, status: "none" } })}>
              Reiniciar solicitud (desarrollo)
            </Button>
          ) : null}
        </Enter>
      ) : (
        <Enter index={1}>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!complete) return;
              updateProfile({ psychologist: { ...form, status: "review", submittedAt: new Date().toISOString() } });
            }}
          >
            <Field label="Nombre completo" value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} autoComplete="name" />
            <Field
              label="Número de licencia o colegiatura"
              hint="Lo verificamos antes de que tu perfil aparezca en el directorio."
              value={form.license}
              onChange={(e) => set({ license: e.target.value })}
            />
            <fieldset className="space-y-2">
              <legend className="text-[13px] text-muted-foreground">Especialidades</legend>
              <div className="flex flex-wrap gap-2 pt-1">
                {SPECIALTIES.map((s) => {
                  const selected = form.specialties.includes(s);
                  return (
                    <label
                      key={s}
                      className={`inline-flex h-9 cursor-pointer items-center rounded-full border px-3.5 text-sm transition-colors duration-small has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-voice ${
                        selected ? "border-voice/50 bg-voice/10 text-voice" : "border-border/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
                        onChange={() => set({ specialties: selected ? form.specialties.filter((x) => x !== s) : [...form.specialties, s] })}
                      />
                      {s}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <Field
              label="Tu link de Google Meet"
              hint="Es el enlace fijo que usarán tus pacientes para entrar a la sesión."
              placeholder="https://meet.google.com/…"
              type="url"
              value={form.meetLink}
              onChange={(e) => set({ meetLink: e.target.value })}
              autoCapitalize="none"
              spellCheck={false}
            />
            <Field label="Sobre ti (opcional)" multiline maxLength={280} value={form.bio} onChange={(e) => set({ bio: e.target.value })} />
            <Button type="submit" size="lg" className="w-full" disabled={!complete}>
              Enviar para verificación
            </Button>
          </form>
        </Enter>
      )}
    </div>
  );
};

export default SoyPsicologo;
