import React, { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, Video } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Enter } from "../components/motion/Motion";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/Dialog";
import { Avatar } from "../features/care/components/CareParts";
import { activeConversation, care, useCare } from "../features/care/store";
import { findPsychologist } from "../features/care/data";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-replica text-xl font-medium leading-[26px] text-foreground">{title}</h2>
      {children}
    </section>
  );
}

/**
 * El perfil de un psicólogo (app/psicologo/[id].tsx). Solo se trabaja con uno a la vez: con otro activo,
 * para cambiar hay que terminar el proceso desde su perfil, con confirmación, porque deja de compartir el
 * diario y cierra la conversación.
 */
export const PsicologoPerfil: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useCare();
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const psychologist = findPsychologist(id);
  if (!psychologist) return <Navigate to="/chat" replace />;

  const active = activeConversation(state);
  const isMine = active?.psychologistId === psychologist.id;
  const current = active && !isMine ? findPsychologist(active.psychologistId) : null;
  const firstName = psychologist.name.split(" ")[0];

  const open = () => {
    if (isMine || care.startConversation(psychologist.id)) navigate("/chat");
  };

  return (
    <div className="mx-auto max-w-[680px] space-y-6">
      <PageHeader title="" fallback="/chat" />

      <Enter className="flex flex-col items-center gap-3 text-center">
        <Avatar name={psychologist.name} size={72} />
        <h1 className="font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground">{psychologist.name}</h1>
        <p className="text-[15px] text-muted-foreground">
          {psychologist.title} · {psychologist.years} años de experiencia
        </p>
        <p className="flex items-center gap-1.5 text-[13px] text-voice">
          <BadgeCheck size={16} aria-hidden="true" />
          Licencia verificada · {psychologist.license}
        </p>
      </Enter>

      <Enter index={1}>
        {current ? (
          <div className="space-y-1 rounded-md bg-surface px-4 py-3">
            <p className="text-[15px] font-semibold text-foreground">Ya trabajas con {current.name}</p>
            <p className="text-[13px] leading-[18px] text-muted-foreground">
              En Replica trabajas con un psicólogo a la vez. Para cambiar, termina tu proceso desde el perfil de {current.name.split(" ")[0]}.
            </p>
          </div>
        ) : (
          <Button size="lg" className="w-full" onClick={open}>
            {isMine ? "Volver a la conversación" : `Escribirle a ${firstName}`}
          </Button>
        )}
      </Enter>

      <Enter index={2} className="space-y-7">
        <Section title="Sobre mí">
          <p className="font-voice text-[17px] leading-[26px] text-foreground">{psychologist.bio}</p>
        </Section>
        <Section title="Enfoque">
          <p className="text-base text-foreground">{psychologist.approach}</p>
        </Section>
        <Section title="Especialidades">
          <p className="text-base text-voice">{psychologist.specialties.join(" · ")}</p>
        </Section>
        <Section title="Sesiones">
          <p className="flex items-center gap-2 text-base text-foreground">
            <Video size={18} className="text-muted-foreground" aria-hidden="true" />
            50 minutos por Google Meet
          </p>
        </Section>
      </Enter>

      {isMine && active ? (
        <Enter index={3} className="flex justify-center pb-4">
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirmingEnd(true)}>
            Terminar mi proceso con {firstName}
          </Button>
        </Enter>
      ) : null}

      <ConfirmDialog
        open={confirmingEnd}
        onClose={() => setConfirmingEnd(false)}
        onConfirm={() => {
          if (active) care.end(active.id);
          navigate("/chat", { replace: true });
        }}
        title={`¿Terminar tu proceso con ${firstName}?`}
        description="La conversación se guarda, pero ya no podrán escribirse ni tendrá acceso a tu diario. Después podrás elegir a otro psicólogo."
        confirmLabel="Terminar"
        destructive
      />
    </div>
  );
};

export default PsicologoPerfil;
