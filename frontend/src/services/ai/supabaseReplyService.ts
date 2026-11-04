import type { SupabaseClient } from "@supabase/supabase-js";
import { paceReply } from "./pace";
import type { ReplyContent, ReplyService } from "./types";

// La réplica sale de la Edge Function generate-reply: la web nunca llama a Gemini. Llega completa y
// se muestra con el mismo ritmo de siempre. Las réplicas del día no pasan por aquí: las genera el
// servidor a su hora, y features/journal/dayReplies.ts las recibe.
export function supabaseReplyService(supabase: SupabaseClient): ReplyService {
  return {
    streamReply(request, handlers) {
      let stop: (() => void) | null = null;
      let cancelled = false;

      supabase.functions
        .invoke<{ reply: ReplyContent }>("generate-reply", { body: { entryId: request.noteId } })
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error || !data) throw error ?? new Error("Sin réplica");
          stop = paceReply(data.reply, handlers);
        })
        .catch((error: Error) => {
          if (!cancelled) handlers.onError?.(error);
        });

      return () => {
        cancelled = true;
        stop?.();
      };
    },
  };
}
