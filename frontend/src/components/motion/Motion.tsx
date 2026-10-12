import React from "react";

/**
 * Entrada de contenido (DESIGN.md §7.2): sube 10 px y aparece, escalonado 50 ms por `index`.
 * Con `disabled`, ya está en su lugar.
 */
export const Enter: React.FC<{
  index?: number;
  delay?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ index = 0, delay, disabled, className = "", children }) =>
  disabled ? (
    <div className={className}>{children}</div>
  ) : (
    <div
      className={`enter ${className}`}
      style={
        {
          "--enter-index": index,
          ...(delay !== undefined ? { animationDelay: `${delay}ms` } : null),
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );

/**
 * El aura de la réplica: un halo malva que respira lento (ciclo de 5,2 s) mientras la IA escribe.
 * Solo aparece cuando habla la IA (components/motion/ai-aura.tsx de la app).
 */
export const AiAura: React.FC<{ size?: number; active?: boolean; children: React.ReactNode }> = ({
  size = 48,
  active = true,
  children,
}) => (
  <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
    <span aria-hidden="true" className={`ai-aura absolute inset-0 rounded-full ${active ? "ai-aura-active" : ""}`} />
    <span className="relative">{children}</span>
  </div>
);

/**
 * Texto que llega palabra por palabra (components/motion/word-reveal.tsx de la app).
 * - `stagger`: las palabras entran escalonadas (45 ms), para el titular de una réplica en vivo.
 * - `stream`: el texto ya llega por partes; cada palabra nueva aparece con un fundido corto.
 * - `none`: en su lugar.
 */
export const WordReveal: React.FC<{
  text: string;
  mode?: "stagger" | "stream" | "none";
  className?: string;
  as?: "p" | "h2" | "h3" | "span";
}> = ({ text, mode = "none", className = "", as: Tag = "p" }) => {
  if (mode === "none") return <Tag className={className}>{text}</Tag>;
  const words = text.split(" ");
  return (
    <Tag className={className} aria-live={mode === "stream" ? "polite" : undefined}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span
            className="word-in inline-block"
            style={mode === "stagger" ? { animationDelay: `${i * 45}ms` } : undefined}
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  );
};
