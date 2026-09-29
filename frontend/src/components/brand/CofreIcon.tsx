/**
 * El cofre: un baúl de tapa curva con un corazón en terracota (emotion) al frente.
 * Mismo trazo (2 px) y geometría exacta que la app móvil (zairo-main/components/brand/cofre-icon.tsx).
 */
export function CofreIcon({
  size = 24,
  className = "",
  color = "currentColor",
  heartColor = "var(--emotion)",
}: {
  size?: number;
  className?: string;
  color?: string;
  heartColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M4 10V8.5A4.5 4.5 0 0 1 8.5 4h7A4.5 4.5 0 0 1 20 8.5V10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x={3}
        y={10}
        width={18}
        height={10}
        rx={2.5}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M12 18.2c-2.3-1.5-2.9-2.4-2.9-3.2 0-.8.6-1.4 1.4-1.4.6 0 1.1.3 1.5.9.4-.6.9-.9 1.5-.9.8 0 1.4.6 1.4 1.4 0 .8-.6 1.7-2.9 3.2z"
        fill={heartColor}
      />
    </svg>
  );
}

export default CofreIcon;
