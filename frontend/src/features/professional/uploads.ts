import { useCallback, useRef, useState } from "react";
import type { DropItem } from "../../components/ui/FileDropzone";
import { MAX_DOCUMENT_BYTES, MAX_DOCUMENTS, professionalService, type UploadedDocument } from "../../services/professional";

type Item = DropItem & { uploaded?: UploadedDocument };

const isPdf = (file: File) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

/**
 * Los PDF de una solicitud mientras se llena: cada uno sube al elegirlo, con su progreso, y se puede quitar
 * antes de enviar. `room` es cuántos caben todavía, contando los que ya se enviaron y se quedan.
 */
export function useUploads(room: number) {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const counter = useRef(0);

  const patch = useCallback((key: string, change: Partial<Item>) => {
    setItems((list) => list.map((x) => (x.key === key ? { ...x, ...change } : x)));
  }, []);

  const add = useCallback(
    (files: File[]) => {
      const valid = items.filter((x) => !x.error).length;
      const free = room - valid;
      setError(
        files.length > free
          ? `Caben ${MAX_DOCUMENTS} documentos en total. ${free > 0 ? `Elige hasta ${free} más.` : "Quita uno para agregar otro."}`
          : null
      );
      const next: Item[] = files.slice(0, Math.max(free, 0)).map((file) => {
        counter.current += 1;
        const key = `archivo-${counter.current}`;
        const base = { key, name: file.name, sizeBytes: file.size, progress: 0, done: false };
        if (!isPdf(file)) return { ...base, done: true, error: "Este archivo no es un PDF." };
        if (file.size > MAX_DOCUMENT_BYTES) return { ...base, done: true, error: "Pesa más de 10 MB. Prueba con una versión más liviana." };
        professionalService
          .uploadDocument(file, (progress) => patch(key, { progress }))
          .then(
            (uploaded) => patch(key, { uploaded, done: true, progress: 1 }),
            () => patch(key, { done: true, error: "No pudimos subirlo. Revisa tu conexión y vuelve a elegirlo." })
          );
        return base;
      });
      setItems((list) => [...list, ...next]);
    },
    [items, room, patch]
  );

  const remove = useCallback(
    (key: string) => {
      const item = items.find((x) => x.key === key);
      if (item?.uploaded) void professionalService.discardDocument(item.uploaded).catch(() => {});
      setItems((list) => list.filter((x) => x.key !== key));
      setError(null);
    },
    [items]
  );

  const reset = useCallback(() => {
    setItems([]);
    setError(null);
  }, []);

  return {
    items,
    error,
    add,
    remove,
    reset,
    uploaded: items.flatMap((x) => (x.uploaded && !x.error ? [x.uploaded] : [])),
    uploading: items.some((x) => !x.done),
  };
}
