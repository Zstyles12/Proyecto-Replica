import React, { useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { Enter } from "../components/motion/Motion";
import { Segmented } from "../components/ui/Segmented";
import { PhraseCard } from "../features/cofre/components/PhraseCard";
import { useFavoritePhrases, useReplyPhrases } from "../features/cofre/store";

type Tab = "guardadas" | "replicas";

// Mi cofre (app/cofre.tsx): las frases que guardaste con el corazón y las que Replica destiló de tus notas.
export const Cofre: React.FC = () => {
  const saved = useFavoritePhrases();
  const replies = useReplyPhrases();
  const [tab, setTab] = useState<Tab>("guardadas");
  const list = tab === "guardadas" ? saved : replies;

  return (
    <div className="mx-auto max-w-[680px] space-y-5">
      <PageHeader title="Mi cofre" fallback="/" />
      <Enter className="space-y-3">
        <p className="px-1 text-[15px] leading-[21px] text-muted-foreground">
          {tab === "guardadas"
            ? "Las frases que marques como favoritas, para volver a ellas cuando las necesites."
            : "Cada réplica deja una frase para llevarte. Aquí están todas."}
        </p>
        <Segmented<Tab>
          label="Qué frases ver"
          className="w-full"
          value={tab}
          onChange={setTab}
          options={[
            { value: "guardadas", label: `Guardadas · ${saved.length}` },
            { value: "replicas", label: `De tus réplicas · ${replies.length}` },
          ]}
        />
      </Enter>

      <div className="space-y-3">
        {list.length ? (
          list.map((p, i) => (
            <Enter key={`${tab}-${p.key}`} index={Math.min(i, 6)}>
              <PhraseCard phrase={p} />
            </Enter>
          ))
        ) : (
          <p className="rounded-md bg-surface-sunken p-4 text-[15px] leading-[21px] text-muted-foreground">
            {tab === "guardadas"
              ? "Marca como favorita una frase del día o de una réplica y quedará guardada aquí."
              : "Escribe una nota y pide la réplica: la frase que destile llegará aquí."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Cofre;
