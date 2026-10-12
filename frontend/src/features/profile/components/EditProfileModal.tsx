import React, { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Dialog } from "../../../components/ui/Dialog";
import { Button } from "../../../components/ui/Button";
import { Avatar } from "../../care/components/CareParts";
import { updateProfile, useProfile } from "../store";

const INTENTION_MAX = 60;
// La foto se recorta en cuadrado y se guarda pequeña: es solo para el perfil.
const PHOTO_SIZE = 320;

// Recorta al centro en cuadrado y la reduce, como la app (features/profile/photo.ts).
function cropSquare(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = PHOTO_SIZE;
      canvas.height = PHOTO_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("sin canvas"));
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("imagen no válida"));
    };
    img.src = url;
  });
}

/** Editar el perfil (app/editar-perfil.tsx): foto, nombre y una frase propia. */
export const EditProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const profile = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(profile.name);
  const [intention, setIntention] = useState(profile.intention);
  const [notice, setNotice] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);

  // Cada vez que se abre, parte de lo que está guardado.
  if (isOpen && !wasOpen) {
    setName(profile.name);
    setIntention(profile.intention);
    setNotice(null);
  }
  if (isOpen !== wasOpen) setWasOpen(isOpen);

  const clean = name.trim();

  const choose = async (file: File | undefined) => {
    setNotice(null);
    if (!file) return;
    try {
      updateProfile({ photo: await cropSquare(file) });
    } catch {
      setNotice("No pudimos usar esa foto. Prueba con otra.");
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clean) return;
    updateProfile({ name: clean, intention: intention.trim().replace(/^[“"]|[”"]$/g, "") });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Tu perfil"
      description="Solo tú lo ves. Tu nombre se usa para saludarte."
      size="sm"
      footer={
        <Button type="submit" form="edit-profile-form" size="lg" className="w-full" disabled={!clean}>
          Guardar
        </Button>
      }
    >
      <form id="edit-profile-form" onSubmit={save} className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar name={clean || "?"} size={64} photo={profile.photo} />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              {profile.photo ? "Cambiar foto" : "Elegir foto"}
            </Button>
            {profile.photo ? (
              <button
                type="button"
                onClick={() => updateProfile({ photo: null })}
                aria-label="Quitar la foto"
                className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                choose(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        {notice ? (
          <p role="alert" className="text-xs text-emotion">
            {notice}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="edit-profile-name" className="block px-1 text-[13px] text-muted-foreground">
            Tu nombre
          </label>
          <input
            id="edit-profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Tu nombre"
            autoComplete="given-name"
            data-autofocus
            className="h-12 w-full rounded-md border border-border bg-surface px-4 text-base text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-voice/40"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <label htmlFor="edit-profile-intention" className="text-[13px] text-muted-foreground">
              Una frase que te acompañe · opcional
            </label>
            <span className="text-xs text-muted-foreground" aria-hidden="true">
              {intention.length}/{INTENTION_MAX}
            </span>
          </div>
          <input
            id="edit-profile-intention"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            maxLength={INTENTION_MAX}
            placeholder="Por ejemplo: aprender a poner límites"
            className="h-12 w-full rounded-md border border-border bg-surface px-4 font-replica text-base italic text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-voice/40"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default EditProfileModal;
