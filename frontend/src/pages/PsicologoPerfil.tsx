import React, { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, Video } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Enter } from "../components/motion/Motion";
import { Button } from "../components/ui/Button";
import { ConfirmDialog, Dialog } from "../components/ui/Dialog";
import { Field } from "../components/ui/Field";
import { Avatar } from "../features/care/components/CareParts";
import { activeConversation, care, pendingRequest, useCare } from "../features/care/store";
import { findPsychologist } from "../features/care/data";
import { currentUserId } from "../lib/session";

const NOTE_MAX = 2000;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-replica text-xl font-medium leading-[26px] text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-md bg-surface px-4 py-3">
      <p className="text-[15px] font-semibold text-foreground">{title}</p>
      <p className="text-[13px] leading-[18px] text-muted-foreground">{children}</p>
    </div>
  );
}

/**
 * El perfil de un psicólogo (DESIGN-WEB.md §10). El acompañamiento empieza con una solicitud y solo se
 * trabaja con uno a la vez: con otro activo o una solicitud pendiente, no se pide otra. Para cambiar hay
 * que terminar el proceso desde su perfil, con confirmación, porque deja de compartir el diario y cierra
 * la conversación.
 */
export const PsicologoPerfil: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useCare();
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [asking, setAsking] = useState(false);
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const psychologist = findPsychologist(id);
  if (!psychologist) return <Navigate to="/chat" replace />;

  const active = activeConversation(state);
  const isMine = active?.psychologistId === psychologist.id;
  const current = active && !isMine ? findPsychologist(active.psychologistId) : null;
  const pending = pendingRequest(state);
  const pendingHere = pending?.psychologistId === psychologist.id ? pending : null;
  const pendingOther = pending && !pendingHere ? findPsychologist(pending.psychologistId) : null;
  const firstName = psychologist.name.split(" ")[0];

  const sendRequest = async () => {
    if (sending) return;
    setSending(true);
    setFailed(null);
    const ok = await care.request(psychologist.id, note);
    setSending(false);
    if (!ok) {
      setFailed("No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo otra vez.");
      return;
    }
    setAsking(false);
    setNote("");
  };

  const withdraw = async () => {
    setFailed(null);
    if (pendingHere && !(await care.withdraw(pendingHere.id))) setFailed("No pudimos retirar tu solicitud. Inténtalo otra vez.");
  };

  let action: React.ReactNode;
  if (psychologist.id === currentUserId()) {
    action = (
      <Notice title="Este es tu perfil público">
        Así te ven las personas en el directorio.
      </Notice>
    );
  } else if (current) {
    action = (
      <Notice title={`Ya trabajas con ${current.name}`}>
        En Replica trabajas con un psicólogo a la vez. Para cambiar, termina tu proceso desde el perfil de {current.name.split(" ")[0]}.
      </Notice>
    );
  } else if (pendingOther) {
    action = (
      <Notice title={`Ya pediste acompañamiento a ${pendingOther.name}`}>
        En Replica trabajas con un psicólogo a la vez. Si {pendingOther.name.split(" ")[0]} no puede, aquí podrás pedírselo a otro.
      </Notice>
    );
  } else if (pendingHere) {
    action = (
      <div className="space-y-3 rounded-md bg-surface px-4 py-3">
        <div className="space-y-1">
          <p role="status" className="text-[15px] font-semibold text-foreground">
            Esperando respuesta de {firstName}
          </p>
          <p className="text-[13px] leading-[18px] text-muted-foreground">Si acepta, se abre el chat. Lo verás en Chat.</p>
        </div>
        <Button variant="secondary" size="sm" className="h-11" onClick={() => setConfirmingWithdraw(true)}>
          Retirar solicitud
        </Button>
      </div>
    );
  } else if (isMine) {
    action = (
      <Button size="lg" className="w-full" onClick={() => navigate("/chat")}>
        Volver a la conversación
      </Button>
    );
  } else {
    action = (
      <Button size="lg" className="w-full" onClick={() => setAsking(true)}>
        Pedir acompañamiento
      </Button>
    );
  }

  return (
    <div className="mx-auto max-w-[680px] space-y-6 lg:mx-0">
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

      <Enter index={1} className="space-y-2">
        {action}
        {failed && !asking ? (
          <p role="alert" className="text-[13px] text-emotion">
            {failed}
          </p>
        ) : null}
      </Enter>

      <Enter index={2} className="space-y-7">
        {psychologist.bio ? (
          <Section title="Sobre mí">
            <p className="font-voice text-[17px] leading-[26px] text-foreground">{psychologist.bio}</p>
          </Section>
        ) : null}
        {psychologist.approach ? (
          <Section title="Enfoque">
            <p className="text-base text-foreground">{psychologist.approach}</p>
          </Section>
        ) : null}
        <Section title="Especialidades">
          <p className="text-base text-voice">{psychologist.specialties.join(" · ")}</p>
        </Section>
        <Section title="Sesiones">
          <p className="flex items-center gap-2 text-base text-foreground">
            <Video size={18} className="text-muted-foreground" aria-hidden="true" />
            {psychologist.sessionMinutes} minutos por Google Meet
          </p>
        </Section>
      </Enter>

      {isMine && active ? (
        <Enter index={3} className="flex justify-center pb-4">
          <Button variant="ghost" size="sm" className="!text-destructive" onClick={() => setConfirmingEnd(true)}>
            Terminar mi proceso con {firstName}
          </Button>
        </Enter>
      ) : null}

      <Dialog
        open={asking}
        onClose={() => setAsking(false)}
        title={`Pedir acompañamiento a ${firstName}`}
        description={`${firstName} lee tu solicitud y decide si puede acompañarte. Si acepta, se abre el chat.`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAsking(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => void sendRequest()} aria-busy={sending || undefined}>
              {sending ? "Enviando…" : "Enviar solicitud"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field
            label="Cuéntale, si quieres, qué te trae"
            multiline
            maxLength={NOTE_MAX}
            count={{ value: note.length, max: NOTE_MAX }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            data-autofocus
          />
          {failed ? (
            <p role="alert" className="text-[13px] text-emotion">
              {failed}
            </p>
          ) : null}
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmingWithdraw}
        onClose={() => setConfirmingWithdraw(false)}
        onConfirm={() => void withdraw()}
        title="¿Retirar tu solicitud?"
        description={`${firstName} ya no la verá. Después podrás pedir acompañamiento a quien quieras.`}
        confirmLabel="Retirar"
      />

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
