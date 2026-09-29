import React from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { INICIO_CONTENT } from "../../../data/inicioContent";

interface ClosingCardProps {
  isPrivate: boolean;
  onDismiss: () => void;
  onViewInNotes: () => void;
}

/**
 * Tarjeta de cierre según Sección 6 de DESIGN.md:
 * - Dice qué pasa con la nota guardada ("Guardada en tu diario" o "Nota privada").
 * - Acciones: "Listo" y "Ver en Notas ›".
 * - Nunca invita a escribir otra nota enseguida para respetar la calma.
 */
export const ClosingCard: React.FC<ClosingCardProps> = ({
  isPrivate,
  onDismiss,
  onViewInNotes,
}) => {
  const { closing } = INICIO_CONTENT;

  return (
    <Card variant="flat" className="space-y-4 animate-section-enter border-border/40">
      <div className="flex items-center gap-2.5 text-voice">
        {isPrivate ? <Lock size={18} /> : <CheckCircle2 size={18} />}
        <h4 className="font-replica text-xl font-medium text-foreground">
          {isPrivate ? closing.titlePrivate : closing.titlePublic}
        </h4>
      </div>

      <p className="font-voice text-sm text-muted-foreground leading-relaxed">
        {isPrivate ? closing.bodyPrivate : closing.bodyPublic}
      </p>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="ghost" size="sm" onClick={onViewInNotes}>
          {closing.buttonViewInNotes}
        </Button>
        <Button variant="primary" size="sm" onClick={onDismiss}>
          {closing.buttonReady}
        </Button>
      </div>
    </Card>
  );
};
