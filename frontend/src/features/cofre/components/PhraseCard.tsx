import React from "react";
import { useNavigate } from "react-router-dom";
import { Quote, Share } from "lucide-react";
import { AnimatedHeart } from "../../../components/motion/AnimatedHeart";
import { favorites, useIsFavorite, type Phrase } from "../store";
import { openShare } from "../share";
import { playSound } from "../../../lib/sounds";

const LABEL: Record<Phrase["kind"], string> = {
  replica: "Destilado por Replica",
  aliento: "Frase del día",
  cita: "Cita del día",
};

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", { day: "numeric", month: "short" }).replace(".", "");
}

const roundAction =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-small active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice";

// El corazón late al guardar la frase y se rompe al quitarla.
const FavoriteButton = React.forwardRef<HTMLButtonElement, { phraseKey: string }>(({ phraseKey }, ref) => {
  const favorite = useIsFavorite(phraseKey);
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        playSound(favorite ? "favoritoQuitar" : "favorito");
        favorites.toggle(phraseKey);
      }}
      aria-label={favorite ? "Quitar de mi cofre" : "Guardar en mi cofre"}
      aria-pressed={favorite}
      className={`${roundAction} ${favorite ? "bg-emotion/15" : "bg-muted hover:bg-muted/80"}`}
    >
      <AnimatedHeart active={favorite} size={18} color="var(--emotion)" outlineColor="var(--voice)" />
    </button>
  );
});
FavoriteButton.displayName = "FavoriteButton";

/**
 * Una frase del cofre: destilada de una réplica, de aliento o una cita (features/cofre/components/
 * phrase-card.tsx de la app). Se guarda con el corazón y se comparte como imagen. Las de una réplica
 * llevan a su nota, salvo que ya estés en ella (`linked = false`).
 */
export const PhraseCard: React.FC<{
  phrase: Phrase;
  linked?: boolean;
  heartRef?: React.Ref<HTMLButtonElement>;
}> = ({ phrase, linked = true, heartRef }) => {
  const navigate = useNavigate();
  const opensNote = linked && !!phrase.noteId;
  // Junto a su propia nota no se repite de dónde salió ni cuándo: está justo arriba.
  const inItsNote = !linked && phrase.kind === "replica";
  const footer =
    phrase.kind === "replica" ? (inItsNote ? null : `De: “${phrase.source}”`) : phrase.kind === "cita" ? `— ${phrase.author}` : null;

  return (
    <article
      className={`space-y-3 rounded-lg border border-border/35 bg-surface p-5 dark:border-border/60 ${
        opensNote ? "cursor-pointer transition-colors hover:border-border/70" : ""
      }`}
      onClick={opensNote ? () => navigate(`/notas/${phrase.noteId}`) : undefined}
    >
      <div className="flex items-center gap-2">
        <Quote size={15} className="fill-reply text-reply" aria-hidden="true" />
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.7px] text-reply">{LABEL[phrase.kind]}</span>
        {phrase.date && !inItsNote ? <span className="text-xs text-muted-foreground">{shortDate(phrase.date)}</span> : null}
      </div>
      <blockquote className="font-replica text-[20px] italic leading-[29px] text-foreground">“{phrase.text}”</blockquote>
      <div className="flex items-center gap-2">
        {opensNote ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/notas/${phrase.noteId}`);
            }}
            className={`min-w-0 flex-1 truncate rounded text-left text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice`}
            aria-label={`Abrir la nota de la que salió: ${phrase.source}`}
          >
            {footer}
          </button>
        ) : (
          <span className={`min-w-0 flex-1 truncate text-xs ${phrase.kind === "cita" ? "text-[13px] font-medium" : ""} text-muted-foreground`}>
            {footer}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openShare(phrase.key);
          }}
          aria-label="Compartir como imagen"
          className={`${roundAction} bg-muted text-voice hover:bg-muted/80`}
        >
          <Share size={17} aria-hidden="true" />
        </button>
        <FavoriteButton ref={heartRef} phraseKey={phrase.key} />
      </div>
    </article>
  );
};
