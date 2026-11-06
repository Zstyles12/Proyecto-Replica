import React from "react";
import { SPECIALTIES } from "../../care/data";

// Las especialidades como casillas en pastillas (DESIGN-WEB.md §10): en la solicitud y en el perfil público.
export const SpecialtyPicker: React.FC<{ value: string[]; onChange: (value: string[]) => void; error?: string | null; errorId: string }> = ({
  value,
  onChange,
  error,
  errorId,
}) => (
  <fieldset className="space-y-2" aria-describedby={error ? errorId : undefined}>
    <legend className="text-[13px] text-muted-foreground">Especialidades</legend>
    <div className="flex flex-wrap gap-2 pt-1">
      {[...new Set([...SPECIALTIES, ...value])].map((s) => {
        const selected = value.includes(s);
        return (
          <label
            key={s}
            className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm transition-colors duration-small has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-voice ${
              selected ? "border-voice/50 bg-voice/10 text-voice" : "border-border/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={selected}
              aria-invalid={(!!error && !value.length) || undefined}
              onChange={() => onChange(selected ? value.filter((x) => x !== s) : [...value, s])}
            />
            {s}
          </label>
        );
      })}
    </div>
    {error ? (
      <p id={errorId} role="alert" className="text-[13px] text-emotion">
        {error}
      </p>
    ) : null}
  </fieldset>
);
