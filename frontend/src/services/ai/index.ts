import { mockReplyService } from "./mockReplyService";
import type { ReplyService } from "./types";

// Punto único de reemplazo: cuando exista la Edge Function con Gemini, se cambia aquí.
// La web nunca llama a Gemini directamente.
export const replyService: ReplyService = mockReplyService;

export type { ReplyContent, ReplyRequest, ReplyService } from "./types";
