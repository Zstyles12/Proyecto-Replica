import { supabase } from "../../lib/supabase/client";
import { mockReplyService } from "./mockReplyService";
import { supabaseReplyService } from "./supabaseReplyService";
import type { ReplyService } from "./types";

// Con Supabase, la Edge Function con Gemini; sin él, las réplicas de ejemplo. La web nunca llama a
// Gemini directamente.
export const replyService: ReplyService = supabase ? supabaseReplyService(supabase) : mockReplyService;

export type { ReplyContent, ReplyRequest, ReplyService } from "./types";
