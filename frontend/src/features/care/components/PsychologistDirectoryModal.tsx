import React from "react";
import { X, Check, ShieldCheck } from "lucide-react";
import { CHAT_CONTENT, type PsychologistData } from "../../../data/chatContent";

interface PsychologistDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePsychologistId: string;
  onSelectPsychologist: (psiId: string) => void;
}

export const PsychologistDirectoryModal: React.FC<PsychologistDirectoryModalProps> = ({
  isOpen,
  onClose,
  activePsychologistId,
  onSelectPsychologist,
}) => {
  if (!isOpen) return null;

  const { directory, psychologists } = CHAT_CONTENT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-section-enter">
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-surface-raised border border-border/50 p-6 md:p-8 space-y-6 shadow-raised relative">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between pb-3 border-b border-border/20">
          <div>
            <h2 className="font-replica text-2xl font-normal text-foreground">
              {directory.title}
            </h2>
            <p className="font-voice text-xs md:text-sm text-muted-foreground mt-0.5">
              {directory.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={directory.closeAria}
            className="w-9 h-9 rounded-full bg-surface hover:bg-surface-sunken border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <X size={17} />
          </button>
        </div>

        {/* Lista de psicólogos */}
        <div className="space-y-4">
          {psychologists.map((psi: PsychologistData) => {
            const isActive = psi.id === activePsychologistId;

            return (
              <div
                key={psi.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isActive
                    ? "bg-voice-soft/20 border-voice/50 shadow-xs"
                    : "bg-surface border-border/40 hover:border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-voice-soft text-voice font-semibold flex items-center justify-center text-base shrink-0 shadow-xs">
                      {psi.initials}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-replica text-lg font-medium text-foreground">
                          {psi.name}
                        </h3>
                        <span
                          className="inline-flex items-center gap-0.5 text-[11px] text-voice font-semibold"
                          title="Colegiado y verificado"
                        >
                          <ShieldCheck size={14} className="text-voice" />
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-voice">
                        {psi.title} · {psi.license}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-voice text-voice-foreground text-xs font-semibold shadow-xs shrink-0">
                      <Check size={13} />
                      <span>{directory.activeLabel}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPsychologist(psi.id);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-surface-sunken hover:bg-voice hover:text-voice-foreground border border-border/40 text-xs font-medium transition-colors cursor-pointer shrink-0"
                    >
                      {directory.selectButton}
                    </button>
                  )}
                </div>

                <p className="font-voice text-xs md:text-sm text-foreground/90 leading-relaxed">
                  {psi.bio}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/20 text-xs text-subtle">
                  <span className="font-medium text-voice">
                    {psi.approach} · {psi.years} {directory.experienceSuffix}
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {psi.specialties.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-full bg-surface-sunken text-[11px] text-muted-foreground border border-border/25"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PsychologistDirectoryModal;
