import React from "react";
import { PenLine, Sprout, UserRound } from "lucide-react";
import { USUARIO_CONTENT } from "../../../data/usuarioContent";

interface ProfileHeroProps {
  name: string;
  intention: string;
  memberSince: string;
  onEdit: () => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  name,
  intention,
  memberSince,
  onEdit,
}) => {
  const { hero } = USUARIO_CONTENT;

  // Formato mes y año
  const formattedSince = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(new Date(memberSince));

  const capitalizedSince =
    formattedSince.charAt(0).toUpperCase() + formattedSince.slice(1);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface-raised border border-border/40 shadow-raised p-6 sm:p-7 select-none transition-all">
      {/* Botón flotante para editar perfil */}
      <button
        type="button"
        onClick={onEdit}
        title={hero.editTooltip}
        aria-label={hero.editTooltip}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface hover:bg-surface-sunken border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs active:scale-[0.96]"
      >
        <PenLine size={16} />
      </button>

      <div className="flex flex-col items-center text-center space-y-4">
        {/* Avatar grande con insignia de brote 🌱 */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-voice-soft text-voice font-semibold flex items-center justify-center text-2xl shadow-xs border-2 border-border/30">
            {initials ? initials : <UserRound size={36} className="text-voice" />}
          </div>

          <div
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-voice text-voice-foreground flex items-center justify-center border-2 border-surface-raised shadow-xs"
            title="Miembro de Replica"
          >
            <Sprout size={14} />
          </div>
        </div>

        {/* Nombre y Frase de Intención */}
        <div className="space-y-1.5 max-w-md">
          <h2 className="font-replica text-2xl md:text-3xl font-normal text-foreground tracking-tight">
            {name || "Tu perfil"}
          </h2>

          {intention ? (
            <p className="font-replica italic text-base md:text-lg text-voice leading-snug">
              “{intention}”
            </p>
          ) : (
            <p className="text-xs text-muted-foreground font-voice">
              {hero.noIntentionPrompt}
            </p>
          )}

          <p className="text-xs text-subtle font-voice pt-1">
            {hero.memberSincePrefix} {capitalizedSince}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;
