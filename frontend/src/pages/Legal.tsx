import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { LEGAL_DOCS } from "../data/legal";

// Términos y Privacidad: un resumen en lenguaje claro (app/legal/[doc].tsx). Se puede abrir en
// cualquier momento, también antes de tener cuenta.
export const Legal: React.FC = () => {
  const navigate = useNavigate();
  const { doc = "terminos" } = useParams();
  const content = LEGAL_DOCS[doc] ?? LEGAL_DOCS.terminos;

  return (
    <div className="min-h-screen bg-background bg-warp-lines">
      <div className="mx-auto w-full max-w-[680px] px-5 pb-16 pt-4">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
          aria-label="Volver"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
        >
          <ChevronLeft size={26} aria-hidden="true" />
        </button>
        <h1 className="mt-4 font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground">
          {content.title}
        </h1>
        <p className="mt-3 text-[13px] leading-[18px] text-muted-foreground">
          Resumen en lenguaje claro. El texto legal completo se publicará antes del lanzamiento.
        </p>
        <div className="mt-8 space-y-6">
          {content.sections.map((s) => (
            <section key={s.heading} className="space-y-1.5">
              <h2 className="font-replica text-xl font-medium leading-[26px] text-foreground">{s.heading}</h2>
              <p className="text-[15px] leading-[21px] text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Legal;
