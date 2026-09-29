import React, { useState } from "react";
import { X, UserRound, Sparkles } from "lucide-react";
import { USUARIO_CONTENT } from "../../../data/usuarioContent";

interface EditProfileModalProps {
  isOpen: boolean;
  initialName: string;
  initialIntention: string;
  onClose: () => void;
  onSave: (data: { name: string; intention: string }) => void;
}

const INTENTION_MAX = 60;

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  initialName,
  initialIntention,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialName);
  const [intention, setIntention] = useState(initialIntention);
  const { editModal: copy } = USUARIO_CONTENT;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      intention: intention.trim().replace(/^[“"]|[”"]$/g, ""),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-section-enter">
      <div className="w-full max-w-md rounded-3xl bg-surface-raised border border-border/50 p-6 md:p-7 space-y-5 shadow-raised relative select-none">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-2 border-b border-border/20">
          <div>
            <h3 className="font-replica text-xl font-normal text-foreground">
              {copy.title}
            </h3>
            <p className="text-xs text-muted-foreground font-voice mt-0.5">
              {copy.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-voice flex items-center gap-1.5">
              <UserRound size={13} />
              <span>{copy.nameLabel}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.namePlaceholder}
              className="w-full h-10 px-3.5 rounded-xl bg-surface border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-voice/50 focus:border-voice"
            />
          </div>

          {/* Campo de Frase de Intención */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-voice flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>{copy.intentionLabel}</span>
              </label>
              <span className="text-[11px] font-mono text-subtle">
                {intention.length}/{INTENTION_MAX}
              </span>
            </div>
            <textarea
              value={intention}
              maxLength={INTENTION_MAX}
              onChange={(e) => setIntention(e.target.value)}
              placeholder={copy.intentionPlaceholder}
              rows={2}
              className="w-full p-3 rounded-xl bg-surface border border-border/40 text-sm font-replica italic text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-voice/50 focus:border-voice resize-none leading-relaxed"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-surface hover:bg-surface-sunken text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {copy.cancelButton}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-voice hover:bg-voice-hover text-voice-foreground text-xs font-semibold shadow-xs transition-all active:scale-[0.97] cursor-pointer"
            >
              {copy.saveButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
