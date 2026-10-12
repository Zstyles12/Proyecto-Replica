import React from "react";
import { Check } from "lucide-react";
import { INTENTIONS } from "../intentions";

/** Una casilla de consentimiento: toda la fila se puede tocar; el texto puede llevar enlaces. */
export const CheckRow: React.FC<{
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ checked, onToggle, children }) => (
  <label className="group flex cursor-pointer items-start gap-3 py-2.5">
    <input type="checkbox" checked={checked} onChange={onToggle} className="peer sr-only" />
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border-[1.5px] transition-colors duration-small peer-focus-visible:ring-2 peer-focus-visible:ring-voice peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background ${
        checked ? "border-voice bg-voice" : "border-muted-foreground/60"
      }`}
    >
      {checked ? <Check size={16} strokeWidth={3} className="text-voice-foreground" /> : null}
    </span>
    <span className="flex-1 text-[15px] leading-[21px] text-foreground">{children}</span>
  </label>
);

/**
 * Una opción entre varias (tono, hora de la réplica): un punto que se llena y una línea que explica.
 * La ToneOption de la app (features/profile/components/profile.tsx).
 */
export const ChoiceCard: React.FC<{
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  name: string;
}> = ({ title, description, selected, onSelect, name }) => (
  <label
    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-colors duration-small ${
      selected ? "border-voice/30 bg-voice-soft/50" : "border-transparent bg-surface hover:bg-surface-sunken"
    }`}
  >
    <input type="radio" name={name} checked={selected} onChange={onSelect} className="peer sr-only" />
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-voice peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background ${
        selected ? "bg-voice" : "border-[1.5px] border-border"
      }`}
    >
      {selected ? <Check size={12} strokeWidth={3} className="text-voice-foreground" /> : null}
    </span>
    <span className="flex-1 space-y-0.5">
      <span className="block text-[15px] font-semibold leading-5 text-foreground">{title}</span>
      <span className="block text-[13px] leading-[18px] text-muted-foreground">{description}</span>
    </span>
  </label>
);


/** Qué te trae a Replica: seis caminos en una cuadrícula pareja. La elegida va al perfil. */
export const IntentionPicker: React.FC<{
  value: string | null;
  onChange: (intention: string) => void;
}> = ({ value, onChange }) => (
  <div role="radiogroup" aria-label="Qué te trae a Replica" className="grid grid-cols-2 gap-3">
    {INTENTIONS.map(({ title, line, icon: Icon }) => {
      const selected = value === title;
      return (
        <label
          key={title}
          className={`relative flex h-[138px] cursor-pointer flex-col justify-between rounded-lg border-[1.5px] p-4 transition-all duration-small active:scale-[0.97] ${
            selected ? "border-voice bg-voice/10" : "border-transparent bg-surface hover:bg-surface-sunken"
          }`}
        >
          <input
            type="radio"
            name="intention"
            checked={selected}
            onChange={() => onChange(title)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-small ${
              selected ? "bg-voice text-voice-foreground" : "bg-voice-soft text-voice"
            }`}
          >
            <Icon size={18} />
          </span>
          <span className="space-y-0.5">
            <span className="block text-[15px] font-semibold leading-5 text-foreground">{title}</span>
            <span className="block truncate text-[13px] leading-[18px] text-muted-foreground">{line}</span>
          </span>
          {selected ? (
            <span
              aria-hidden="true"
              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-voice text-voice-foreground"
            >
              <Check size={14} strokeWidth={3} />
            </span>
          ) : null}
          <span className="pointer-events-none absolute inset-0 rounded-lg peer-focus-visible:ring-2 peer-focus-visible:ring-voice" />
        </label>
      );
    })}
  </div>
);
