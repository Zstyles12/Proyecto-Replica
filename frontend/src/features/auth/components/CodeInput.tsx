import React, { useEffect, useRef, useState } from "react";

export const CODE_LENGTH = 6;

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  // Cambia cada vez que el código es incorrecto: las casillas tiemblan.
  errorKey: number;
  error?: boolean;
  disabled?: boolean;
  describedBy?: string;
}

/**
 * Seis casillas para el código del correo (features/auth/components/code-input.tsx de la app). Un solo
 * campo invisible recibe el texto, así funcionan pegar, borrar y el autocompletado del navegador.
 */
export const CodeInput: React.FC<CodeInputProps> = ({ value, onChange, errorKey, error, disabled, describedBy }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative" onClick={() => inputRef.current?.focus()}>
      <div key={errorKey} className={`flex justify-between gap-2 ${errorKey ? "code-shake" : ""}`} aria-hidden="true">
        {Array.from({ length: CODE_LENGTH }, (_, i) => {
          const active = focused && !disabled && i === Math.min(value.length, CODE_LENGTH - 1);
          return (
            <div
              key={i}
              className={`flex h-14 flex-1 items-center justify-center rounded-md bg-surface transition-colors duration-small ${
                error ? "border-[1.5px] border-emotion" : active ? "border-[1.5px] border-voice" : "border border-border/90"
              }`}
            >
              {value[i] ? (
                <span className="font-replica text-[26px] font-medium leading-[32px] text-foreground">{value[i]}</span>
              ) : active ? (
                <span className="code-caret h-[26px] w-[2px] rounded-full bg-voice" />
              ) : null}
            </div>
          );
        })}
      </div>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          if (disabled) return;
          onChange(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH));
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        aria-label="Código de 6 dígitos"
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
        // Invisible pero presente: recibe el teclado y el autocompletado.
        className="absolute inset-0 h-full w-full cursor-default opacity-0"
      />
    </div>
  );
};
