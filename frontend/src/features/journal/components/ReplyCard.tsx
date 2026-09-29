import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, PenLine } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import type { AIReply } from "../../../services/journal";
import { INICIO_CONTENT } from "../../../data/inicioContent";
import { playSound } from "../../../lib/sounds";

interface ReplyCardProps {
  reply: AIReply;
  onWriteAboutThis?: (question: string) => void;
}

/**
 * Tarjeta de la Réplica según Sección 6 y 7.3 de DESIGN.md:
 * - Avatar con brote 🌱 y aura malva respiratoria (ciclo 5.2s).
 * - Titular grande en Alegreya llamando por el nombre.
 * - Análisis en texto con tu cita en itálica salvia.
 * - Rayita voice-soft.
 * - Desplegable "Para seguir escribiendo".
 * - Streaming de palabras progresivo (45 ms por palabra, Sección 7.1).
 */
export const ReplyCard: React.FC<ReplyCardProps> = ({
  reply,
  onWriteAboutThis,
}) => {
  const [isOpenQuestions, setIsOpenQuestions] = useState(true);
  const words = reply.content.split(" ");
  const [visibleCount, setVisibleCount] = useState(0);

  const { reply: replyContent } = INICIO_CONTENT;

  // Streaming progresivo a 45 ms por palabra (Sección 7.1 de DESIGN.md)
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < words.length) {
          const next = prev + 1;
          if (next === words.length) {
            playSound("replica");
          }
          return next;
        }
        clearInterval(interval);
        return prev;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [words.length]);

  const isStreaming = visibleCount < words.length;
  const displayedText = words.slice(0, visibleCount).join(" ");

  return (
    <Card variant="raised" className="space-y-5 animate-section-enter border-reply/30">
      {/* Cabecera con Brote y Aura Malva (ciclo 5.2 s) */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-voice-soft text-voice flex items-center justify-center text-lg animate-malva-aura">
            🌱
          </div>
        </div>
        <div>
          <span className="font-sans text-xs font-semibold text-reply tracking-wide block uppercase">
            {replyContent.tagline}
          </span>
          <span className="text-[11px] text-subtle">
            {isStreaming ? "Tejiendo réplica…" : "Completada"}
          </span>
        </div>
      </div>

      {/* Titular Grande en Alegreya */}
      <h3 className="font-replica text-2xl md:text-3xl font-normal text-foreground leading-snug tracking-tight">
        {reply.title}
      </h3>

      {/* Cuerpo en Alegreya Italic Malva con tu cita en Itálica Salvia */}
      <div className="space-y-3 font-replica text-lg text-reply leading-relaxed italic">
        <p>
          {displayedText}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-reply/60 animate-pulse align-middle" />
          )}
        </p>

        {/* Cita textual del usuario en itálica salvia (Sección 4 de DESIGN.md) */}
        {reply.quote && !isStreaming && (
          <div className="pl-4 border-l-2 border-voice/50 my-2">
            <p className="text-voice font-replica italic text-base">
              "{reply.quote}"
            </p>
          </div>
        )}
      </div>

      {/* Rayita divisoria voice-soft (Sección 6) */}
      <div className="border-b border-voice-soft/60 pt-1" />

      {/* Desplegable "Para seguir escribiendo" */}
      {reply.questions && reply.questions.length > 0 && !isStreaming && (
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={() => setIsOpenQuestions(!isOpenQuestions)}
            className="flex items-center justify-between w-full text-xs font-semibold text-foreground select-none cursor-pointer py-1"
          >
            <span className="uppercase tracking-wider">
              {replyContent.followUpTitle}
            </span>
            {isOpenQuestions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isOpenQuestions && (
            <div className="space-y-3 animate-section-enter pt-1">
              {reply.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-md bg-surface border border-border/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
                >
                  <p className="font-voice text-sm text-foreground flex-1">
                    {q}
                  </p>
                  {onWriteAboutThis && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<PenLine size={13} />}
                      onClick={() => onWriteAboutThis(q)}
                      className="shrink-0 text-voice text-xs"
                    >
                      {replyContent.writeAboutThis}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
