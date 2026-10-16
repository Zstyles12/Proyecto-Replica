import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Avatar } from "../features/care/components/CareParts";
import { PSYCHOLOGISTS } from "../features/care/data";

const SPECIALTIES = [...new Set(PSYCHOLOGISTS.flatMap((p) => p.specialties))].sort();

// El directorio de psicólogos (app/(tabs)/chat/directorio.tsx): todos con su licencia verificada, con
// un filtro por especialidad. Cada uno abre su perfil.
export const Directorio: React.FC = () => {
  const [active, setActive] = useState("all");
  const list = active === "all" ? PSYCHOLOGISTS : PSYCHOLOGISTS.filter((p) => p.specialties.includes(active));
  const options = [{ key: "all", label: "Todos" }, ...SPECIALTIES.map((s) => ({ key: s, label: s }))];

  return (
    <div className="mx-auto max-w-[680px] space-y-4 lg:mx-0">
      <PageHeader title="Psicólogos" fallback="/chat" />
      <p className="text-[15px] leading-[21px] text-muted-foreground">Todos tienen su licencia profesional verificada.</p>

      <div role="radiogroup" aria-label="Especialidad" className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = active === o.key;
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setActive(o.key)}
              className={`inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium transition-colors duration-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                selected ? "border-voice bg-voice text-voice-foreground" : "border-border/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <ul className="space-y-1">
        {list.map((p) => (
          <li key={p.id}>
            <Link
              to={`/psicologo/${p.id}`}
              className="flex items-center gap-3 rounded-md px-3 py-3.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
            >
              <Avatar name={p.name} size={52} />
              <span className="min-w-0 flex-1 space-y-1">
                <span className="block text-[17px] font-semibold text-foreground">{p.name}</span>
                <span className="block text-[13px] text-muted-foreground">
                  {p.title} · {p.years} años de experiencia
                </span>
                <span className="block truncate text-[13px] text-voice">{p.specialties.join(" · ")}</span>
              </span>
              <ChevronRight size={18} className="text-subtle" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Directorio;
