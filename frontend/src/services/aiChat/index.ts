import { supabase } from "../../lib/supabase/client";
import { forgetMockChats, mockAiChatService } from "./mockAiChatService";
import { supabaseAiChatService } from "./supabaseAiChatService";
import type { AiChatService } from "./types";

// Con Supabase, chat-with-ai; sin él, las respuestas de ejemplo guardadas en el navegador.
export const aiChatService: AiChatService = supabase ? supabaseAiChatService(supabase) : mockAiChatService;

export { forgetMockChats };
export type { AiChat, AiChatMessage, AiChatSent, AiChatService } from "./types";
