import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Lock, Unlock, Sparkles, Save } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { INICIO_CONTENT } from "../../../data/inicioContent";

interface WriterSheetProps {
  content: string;
  onChangeContent: (val: string) => void;
  isPrivate: boolean;
  onTogglePrivate: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

export const WriterSheet: React.FC<WriterSheetProps> = ({
  content,
  onChangeContent,
  isPrivate,
  onTogglePrivate,
  onSubmit,
  loading = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState<boolean>(() => {
    return (
      typeof window !== "undefined" &&
      Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  });
  const recognitionRef = useRef<any>(null);

  const { writer } = INICIO_CONTENT;

  // Comprobar e inicializar Web Speech API (02-estructura.md)
  useEffect(() => {
    if (!speechSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "es-ES";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          onChangeContent(content ? `${content} ${transcript}` : transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [content, onChangeContent, speechSupported]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Contar palabras reales
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-surface rounded-xl border border-border/30 p-5 md:p-6 transition-all duration-small shadow-xs relative">
      {/* Área de texto serena */}
      <textarea
        value={content}
        onChange={(e) => onChangeContent(e.target.value)}
        placeholder={writer.placeholder}
        rows={5}
        className="w-full bg-transparent font-voice text-lg md:text-xl text-foreground placeholder:text-subtle focus:outline-none resize-none leading-relaxed"
      />

      {/* Barra de herramientas inferior (Sección 6 de DESIGN.md) */}
      <div className="pt-4 border-t border-border/20 flex flex-wrap items-center justify-between gap-3 select-none">
        {/* Lado izquierdo: Micrófono y Candado transformables */}
        <div className="flex items-center gap-2">
          {/* Botón de Dictado (Web Speech API) */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              aria-label={isListening ? "Detener dictado" : "Iniciar dictado por voz"}
              className={`inline-flex items-center gap-2 h-9 px-3 rounded-full text-xs font-medium border transition-all duration-indicator ease-out cursor-pointer active:scale-[0.97] ${
                isListening
                  ? "bg-voice text-voice-foreground border-voice animate-pulse"
                  : "bg-surface-raised border-border/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={15} />
                  <span className="font-semibold">{writer.listening}</span>
                </>
              ) : (
                <Mic size={15} />
              )}
            </button>
          )}

          {/* Candado "Privada" transformable (Sección 6: suma 'Privada' y crece) */}
          <button
            type="button"
            onClick={onTogglePrivate}
            title={writer.privateTooltip}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium border transition-all duration-indicator ease-out cursor-pointer active:scale-[0.97] ${
              isPrivate
                ? "bg-surface-raised border-voice text-voice font-semibold shadow-xs"
                : "bg-surface-raised border-border/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {isPrivate ? <Lock size={14} className="text-voice" /> : <Unlock size={14} />}
            <span>{isPrivate ? writer.privateBadge : "Pública"}</span>
          </button>
        </div>

        {/* Lado derecho: Contador y Botón principal */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Contador de palabras */}
          <span className="text-xs text-subtle font-mono">
            {wordCount} {writer.wordsSuffix}
          </span>

          {/* Botón principal: "Replica" o "Guardar" */}
          <Button
            type="button"
            variant="primary"
            size="normal"
            disabled={loading || !content.trim()}
            onClick={onSubmit}
            icon={isPrivate ? <Save size={16} /> : <Sparkles size={16} />}
          >
            {isPrivate ? writer.actions.save : writer.actions.replica}
          </Button>
        </div>
      </div>
    </div>
  );
};
