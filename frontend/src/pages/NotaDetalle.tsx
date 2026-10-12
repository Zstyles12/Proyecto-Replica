import React from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { WovenNote } from "../features/journal/components/WovenNote";
import { FavoriteNoteButton } from "../features/notes/components/NoteCard";
import { useNote } from "../features/journal/store";
import { dayLabel } from "../lib/format";

// El detalle de una nota (app/(tabs)/notas/[id].tsx): la réplica si es la primera del día, tu entrada
// plegable, el comentario de la réplica del día (o cuándo llega) y la frase destilada. Es una página con
// su ruta: funciona el botón atrás y el enlace directo.
export const NotaDetalle: React.FC = () => {
  const { id = "" } = useParams();
  const note = useNote(id);

  return (
    <div className="mx-auto max-w-[680px] space-y-4">
      <PageHeader
        title={note ? dayLabel(note.createdAt) : "Nota"}
        fallback="/notas"
        action={note ? <FavoriteNoteButton noteId={note.id} /> : null}
      />
      {note ? (
        <WovenNote noteId={note.id} animate={false} />
      ) : (
        <p className="text-[15px] leading-[21px] text-muted-foreground">Esta nota ya no existe.</p>
      )}
    </div>
  );
};

export default NotaDetalle;
