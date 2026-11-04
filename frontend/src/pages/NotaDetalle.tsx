import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/Dialog";
import { WovenNote } from "../features/journal/components/WovenNote";
import { FavoriteNoteButton } from "../features/notes/components/NoteCard";
import { noteFavorites } from "../features/notes/favorites";
import { favorites, noteKey } from "../features/cofre/store";
import { sharedNotes, useCare } from "../features/care/store";
import { journal, useNote } from "../features/journal/store";
import { dayLabel } from "../lib/format";

// El detalle de una nota (app/(tabs)/notas/[id].tsx): la réplica si es la primera del día, tu entrada
// plegable, el comentario de la réplica del día (o cuándo llega) y la frase destilada. Es una página con
// su ruta: funciona el botón atrás y el enlace directo. Al final, borrarla (DESIGN-WEB.md §11).
export const NotaDetalle: React.FC = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const note = useNote(id);
  const shared = sharedNotes(useCare()).has(id);
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);

  const remove = async () => {
    setFailed(false);
    if (!(await journal.remove(id))) {
      setFailed(true);
      return;
    }
    noteFavorites.forget(id);
    favorites.forget(noteKey(id));
    navigate("/notas", { replace: true, state: { deleted: true } });
  };

  return (
    <div className="mx-auto max-w-[680px] space-y-4 lg:mx-0">
      <PageHeader
        title={note ? dayLabel(note.createdAt) : "Nota"}
        fallback="/notas"
        action={note ? <FavoriteNoteButton noteId={note.id} /> : null}
      />
      {note ? (
        <>
          <WovenNote noteId={note.id} animate={false} />
          <div className="space-y-2 border-t border-border/60 pt-4">
            <Button
              variant="ghost"
              className="-ml-3 !text-destructive"
              icon={<Trash2 size={18} aria-hidden="true" />}
              onClick={() => setConfirming(true)}
            >
              Borrar nota
            </Button>
            {failed ? (
              <p role="alert" className="text-[13px] text-emotion">
                No pudimos borrar la nota. Revisa tu conexión e inténtalo otra vez.
              </p>
            ) : null}
          </div>
          <ConfirmDialog
            open={confirming}
            onClose={() => setConfirming(false)}
            onConfirm={() => void remove()}
            title="¿Borrar esta nota?"
            description={`También se borra su réplica. No se puede deshacer.${shared ? " En el chat se queda como la enviaste." : ""}`}
            confirmLabel="Borrar"
            destructive
          />
        </>
      ) : (
        <p className="text-[15px] leading-[21px] text-muted-foreground">Esta nota ya no existe.</p>
      )}
    </div>
  );
};

export default NotaDetalle;
