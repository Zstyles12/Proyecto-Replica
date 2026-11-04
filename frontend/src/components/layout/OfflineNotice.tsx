import React from "react";
import { useOnline } from "../../lib/offline";

/** Sin conexión (RNF-13, DESIGN-WEB.md §11): un aviso amable, en la voz de Replica, arriba del contenido. */
export const OfflineNotice: React.FC<{ className?: string }> = ({ className = "" }) => {
  const online = useOnline();
  return (
    <div role="status" className={className}>
      {online ? null : (
        <p className="rounded-md bg-reply-soft/40 px-4 py-2.5 font-replica text-[15px] italic leading-[21px] text-reply">
          Estás sin conexión. Lo que escribas se guarda aquí y se envía cuando vuelvas.
        </p>
      )}
    </div>
  );
};
