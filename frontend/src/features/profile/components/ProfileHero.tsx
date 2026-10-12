import React from "react";
import { CalendarHeart, PenLine, Sprout, UserRound } from "lucide-react";
import { Avatar } from "../../care/components/CareParts";

function monthYear(iso: string) {
  return new Date(iso).toLocaleDateString("es", { month: "long", year: "numeric" });
}

/**
 * La ficha de Usuario (features/profile/components/profile.tsx de la app): foto o iniciales, nombre, la
 * frase propia y desde cuándo. Toda la ficha abre "Editar perfil".
 */
export const ProfileHero: React.FC<{
  name: string;
  intention: string;
  photo: string | null;
  memberSince: string;
  onEdit: () => void;
}> = ({ name, intention, photo, memberSince, onEdit }) => (
  <button
    type="button"
    onClick={onEdit}
    aria-label={`${name || "Tu perfil"}. Editar perfil`}
    className="relative w-full overflow-hidden rounded-lg border border-border/40 bg-surface-raised p-6 text-center shadow-raised transition-colors hover:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice dark:shadow-none sm:p-7"
  >
    <span aria-hidden="true" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted-foreground">
      <PenLine size={15} />
    </span>
    <span className="flex flex-col items-center">
      <span className="relative mb-4">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-raised p-1 shadow-raised dark:shadow-none">
          {name || photo ? (
            <Avatar name={name} size={88} photo={photo} />
          ) : (
            <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-voice-soft text-voice">
              <UserRound size={36} aria-hidden="true" />
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-0.5 right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-raised bg-voice text-voice-foreground"
        >
          <Sprout size={14} />
        </span>
      </span>
      <span className="font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground">{name || "Tu perfil"}</span>
      {intention ? (
        <span className="mt-1 max-w-[280px] font-replica text-lg italic leading-[25px] text-voice">“{intention}”</span>
      ) : (
        <span className="mt-1 text-[15px] text-muted-foreground">
          {name ? "Añade una frase que te acompañe" : "Añade tu nombre y una frase que te acompañe"}
        </span>
      )}
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[13px] text-muted-foreground">
        <CalendarHeart size={14} className="text-voice" aria-hidden="true" />
        En Replica desde {monthYear(memberSince)}
      </span>
    </span>
  </button>
);

export default ProfileHero;
