import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Lock, Unlock, Sparkles, Save } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { INICIO_CONTENT } from "../../../data/inicioContent";
import { useDictation } from "../hooks/useDictation";

interface WriterSheetProps {
  content: string;
  onChangeContent: (val: string) => void;
  isPrivate: boolean;
  onTogglePrivate: () => void;
  // Recibe el texto final (con lo que se estaba dictando).
  onSubmit: (text: string) => void;
  // "replica": la primera nota del día, que recibe su réplica al momento. "guardar": las demás y las privadas.
  action: "replica" | "guardar";
  placeholder: string;
  loading?: boolean;
  sheetRef?: React.Ref<HTMLDivElement>;
  privateRef?: React.Ref<HTMLButtonElement>;
  actionRef?: React.Ref<HTMLDivElement>;
}

// Une dos tramos de texto con un espacio, sin duplicarlo.
function join(a: string, b: string) {
  if (!a) return b;
  if (!b) return a;
  return /\s$/.test(a) ? a + b : `${a} ${b}`;
}

export const WriterSheet: React.FC<WriterSheetProps> = ({
  content,
  onChangeContent,
  isPrivate,
  onTogglePrivate,
  onSubmit,
  action,
  placeholder,
  loading = false,
  sheetRef,
  privateRef,
  actionRef,
}) => {
  const { writer } = INICIO_CONTENT;
  // Lo que se está dictando y todavía puede cambiar: se muestra, pero no es parte de la nota.
  const [interim, setInterim] = useState("");
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const onTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (isFinal) {
        const next = join(contentRef.current, text);
        contentRef.current = next;
        onChangeContent(next);
        setInterim("");
      } else {
        setInterim(text);
      }
    },
    [onChangeContent]
  );

  const dictation = useDictation({ onTranscript });
  const isListening = dictation.state === "listening" || dictation.state === "starting";
  const value = join(content, interim);

  const toggleListening = () => {
    if (isListening) dictation.stop();
    else dictation.start();
  };

  const handleSubmit = () => {
    if (isListening) dictation.stop();
    setInterim("");
    onSubmit(value.trim());
  };

  const notice =
    dictation.state === "denied"
      ? writer.dictation.denied
      : dictation.state === "unavailable"
        ? writer.dictation.unavailable
        : dictation.state === "error"
          ? writer.dictation.error
          : null;

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-3">
      <div ref={sheetRef} className="relative rounded-xl border border-border/30 bg-surface p-5 shadow-xs transition-all duration-small md:p-6">
        <label htmlFor="writer-sheet" className="sr-only">
          Tu hoja: escribe lo que quieras
        </label>
        <textarea
          id="writer-sheet"
          data-testid="journal-writer-textarea"
          value={value}
          onChange={(e) => {
            setInterim("");
            onChangeContent(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && value.trim()) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={placeholder}
          rows={5}
          className="writer-ruled-lines w-full min-h-[120px] resize-none bg-transparent p-0 font-voice text-[17px] leading-[24px] text-foreground placeholder:text-subtle focus:outline-none"
        />

        <div className="mt-3 flex select-none flex-wrap items-center justify-between gap-3 border-t border-border/20 pt-4">
          <div className="flex items-center gap-2">
            {dictation.supported && (
              <button
                type="button"
                onClick={toggleListening}
                aria-label={isListening ? writer.dictation.stop : writer.dictation.start}
                aria-pressed={isListening}
                className={`inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full border px-3 text-xs font-medium transition-all duration-indicator ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                  isListening
                    ? "border-voice bg-voice text-voice-foreground"
                    : "border-border/40 bg-surface-raised text-muted-foreground hover:text-foreground"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff size={15} aria-hidden="true" />
                    <span className="font-semibold">{writer.listening}</span>
                  </>
                ) : (
                  <Mic size={15} aria-hidden="true" />
                )}
              </button>
            )}

            <button
              ref={privateRef}
              type="button"
              onClick={onTogglePrivate}
              aria-pressed={isPrivate}
              aria-label="Nota privada"
              title="Solo tú la lees: ni Replica ni tu psicólogo"
              className={`inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all duration-indicator ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                isPrivate
                  ? "border-voice bg-surface-raised font-semibold text-voice shadow-xs"
                  : "border-border/40 bg-surface-raised text-muted-foreground hover:text-foreground"
              }`}
            >
              {isPrivate ? <Lock size={14} aria-hidden="true" /> : <Unlock size={14} aria-hidden="true" />}
              {isPrivate ? <span>{writer.privateBadge}</span> : null}
            </button>
          </div>

          <div ref={actionRef} className="ml-auto flex items-center gap-3">
            <span className="text-xs text-subtle">
              {wordCount} {wordCount === 1 ? "palabra" : writer.wordsSuffix}
            </span>
            <Button
              type="button"
              variant="primary"
              size="normal"
              disabled={loading || !value.trim()}
              onClick={handleSubmit}
              icon={action === "guardar" ? <Save size={16} /> : <Sparkles size={16} />}
              aria-label={action === "replica" ? "Replica: guarda tu nota y Replica te responde" : "Guardar tu nota en tu diario"}
              title="Ctrl + Enter (o ⌘ + Enter)"
            >
              {action === "replica" ? writer.actions.replica : writer.actions.save}
            </Button>
          </div>
        </div>
      </div>

      {notice ? (
        <div className="flex flex-wrap items-center gap-3 px-1" role="status">
          <p className="text-[13px] leading-[18px] text-muted-foreground">{notice}</p>
          <button
            type="button"
            onClick={dictation.reset}
            className="min-h-11 rounded-full px-3 text-[13px] font-medium text-voice hover:bg-voice-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            {writer.dictation.dismiss}
          </button>
        </div>
      ) : null}
    </div>
  );
};
