
/**
 * Selector segmentado (DESIGN.md §6): fondo surface-sunken y una pastilla clara que se desliza (250 ms) a
 * la opción elegida.
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  className = "",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const width = 100 / options.length;
  return (
    <div role="radiogroup" aria-label={label} className={`relative inline-flex rounded-full bg-surface-sunken p-1 ${className}`}>
      <span
        aria-hidden="true"
        className="absolute bottom-1 top-1 rounded-full bg-surface-raised shadow-xs transition-[left] duration-indicator ease-out motion-reduce:transition-none"
        style={{ left: `calc(${index * width}% + 4px)`, width: `calc(${width}% - 8px)` }}
      />
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={`relative min-h-9 flex-1 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
              selected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
