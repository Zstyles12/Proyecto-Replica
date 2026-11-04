import React, { useEffect, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { TABLET, useMediaQuery } from "../../hooks/useMediaQuery";
import { fileSize } from "../../lib/format";

/**
 * Un PDF a la vista (DESIGN-WEB.md §10): desde 768 px, dentro de la página con "Abrir en otra pestaña";
 * en el teléfono, una tarjeta con "Abrir el documento", porque ahí el visor del navegador se lee mejor.
 * `load` trae el enlace, que vence: se pide al abrir, no antes.
 */
export const PdfPreview: React.FC<{ name: string; sizeBytes: number; load: () => Promise<string> }> = ({ name, sizeBytes, load }) => {
  const wide = useMediaQuery(TABLET);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!wide) return;
    let alive = true;
    load().then(
      (u) => alive && setUrl(u),
      () => alive && setFailed(true)
    );
    return () => {
      alive = false;
    };
  }, [wide, load]);

  // La pestaña se abre al tocar y después recibe el enlace: si se abre después, el navegador la bloquea.
  const openTab = () => {
    const tab = window.open(url ?? "", "_blank");
    if (!tab) return;
    tab.opener = null;
    if (!url)
      load().then(
        (u) => {
          tab.location.href = u;
        },
        () => tab.close()
      );
  };

  const head = (
    <div className="flex items-center gap-3">
      <FileText size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block break-words text-[15px] text-foreground">{name}</span>
        <span className="block text-xs text-muted-foreground">{fileSize(sizeBytes)}</span>
      </span>
    </div>
  );

  const button = (text: string) => (
    <button
      type="button"
      onClick={openTab}
      className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[15px] font-semibold text-voice hover:bg-voice-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
    >
      <ExternalLink size={16} aria-hidden="true" />
      {text}
    </button>
  );

  if (!wide) {
    return (
      <div className="space-y-2 rounded-md border border-border/50 bg-surface-raised px-3 py-2.5">
        {head}
        {button("Abrir el documento")}
      </div>
    );
  }

  return (
    <figure className="space-y-2 rounded-md border border-border/50 bg-surface-raised p-3">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        {head}
        {button("Abrir en otra pestaña")}
      </figcaption>
      {failed ? (
        <p role="alert" className="text-[13px] text-emotion">
          No pudimos abrir este documento. Prueba de nuevo en un momento.
        </p>
      ) : url ? (
        <object data={url} type="application/pdf" aria-label={name} className="h-[28rem] w-full rounded bg-surface">
          <p className="p-4 text-[13px] text-muted-foreground">Este navegador no muestra PDF aquí. Ábrelo en otra pestaña.</p>
        </object>
      ) : (
        <div aria-hidden="true" className="skeleton h-[28rem] w-full rounded bg-surface-sunken" />
      )}
    </figure>
  );
};
