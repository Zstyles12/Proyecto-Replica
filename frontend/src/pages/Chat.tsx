import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, Video, ExternalLink, Users, Lock } from "lucide-react";
import { careService, type Message } from "../services/care";
import type { Entry } from "../services/journal";
import { CHAT_CONTENT } from "../data/chatContent";
import { NextSessionBanner } from "../features/care/components/NextSessionBanner";
import { MessageBubble } from "../features/care/components/MessageBubble";
import { TypingIndicator } from "../features/care/components/TypingIndicator";
import { ChatInput } from "../features/care/components/ChatInput";
import { PsychologistDirectoryModal } from "../features/care/components/PsychologistDirectoryModal";
import { ShareNoteModal } from "../features/care/components/ShareNoteModal";

export const Chat: React.FC = () => {
  const [psychologist, setPsychologist] = useState(() =>
    careService.getActivePsychologist()
  );
  const [conversation, setConversation] = useState(() =>
    careService.getActiveConversation()
  );
  const [messages, setMessages] = useState<Message[]>(() =>
    careService.getMessages(conversation.id)
  );
  const [appointment, setAppointment] = useState(() =>
    careService.getUpcomingAppointment(conversation.id)
  );
  const [isSharingDiary, setIsSharingDiary] = useState(() =>
    careService.isSharingDiary(psychologist.id)
  );

  const [isTyping, setIsTyping] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isShareNoteOpen, setIsShareNoteOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { header, diaryShare } = CHAT_CONTENT;

  // Auto-scroll al recibir o enviar mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    const userMsg = await careService.sendMessage(
      conversation.id,
      text,
      (typing) => {
        setIsTyping(typing);
        if (!typing) {
          // Actualizar mensajes al terminar la respuesta simulada
          setMessages(careService.getMessages(conversation.id));
        }
      }
    );

    setMessages((prev) => [...prev, userMsg]);
  };

  const handleShareNote = async (entry: Entry) => {
    const shareMsg = await careService.shareNote(
      conversation.id,
      entry,
      (typing) => {
        setIsTyping(typing);
        if (!typing) {
          setMessages(careService.getMessages(conversation.id));
        }
      }
    );

    setMessages((prev) => [...prev, shareMsg]);
  };

  const handleToggleDiaryShare = () => {
    const next = careService.toggleDiaryShare(psychologist.id);
    setIsSharingDiary(next);
  };

  const handleSelectPsychologist = (psiId: string) => {
    const newConv = careService.setActivePsychologist(psiId);
    const newPsi = careService.getActivePsychologist();

    setPsychologist(newPsi);
    setConversation(newConv);
    setMessages(careService.getMessages(newConv.id));
    setAppointment(careService.getUpcomingAppointment(newConv.id));
    setIsSharingDiary(careService.isSharingDiary(newPsi.id));
  };

  return (
    <div className="pb-12 space-y-6">
      {/* Modal Directorio de Psicólogos */}
      <PsychologistDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        activePsychologistId={psychologist.id}
        onSelectPsychologist={handleSelectPsychologist}
      />

      {/* Modal para Compartir Nota */}
      <ShareNoteModal
        isOpen={isShareNoteOpen}
        onClose={() => setIsShareNoteOpen(false)}
        onShareNote={handleShareNote}
      />

      {/* Cuadrícula responsiva: 2 columnas en escritorio (>= 1024px) */}
      <div className="lg:grid lg:grid-cols-[340px_1fr] lg:gap-8 lg:items-start space-y-6 lg:space-y-0">
        {/* Columna Lateral de Terapia (Escritorio e Información de Terapeuta) */}
        <aside className="space-y-5 select-none">
          {/* Tarjeta del Terapeuta */}
          <div className="p-5 rounded-3xl bg-surface-raised border border-border/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-voice tracking-wide uppercase">
                Tu Psicólogo Asignado
              </span>
              <button
                type="button"
                onClick={() => setIsDirectoryOpen(true)}
                className="text-xs text-voice hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <Users size={13} />
                <span>{header.changePsychologist}</span>
              </button>
            </div>

            <div className="flex items-start gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-full bg-voice-soft text-voice font-semibold flex items-center justify-center text-base shrink-0 shadow-xs border border-border/30">
                {psychologist.initials}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-replica text-lg font-medium text-foreground">
                    {psychologist.name}
                  </h2>
                  <span title={header.verifiedBadge} className="inline-flex items-center">
                    <ShieldCheck
                      size={15}
                      className="text-voice shrink-0"
                    />
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-voice">
                  {psychologist.title} · {psychologist.license}
                </p>
                <p className="text-[11px] text-voice font-medium pt-0.5">
                  {psychologist.approach}
                </p>
              </div>
            </div>

            <p className="font-voice text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/20">
              {psychologist.bio}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {psychologist.specialties.map((spec) => (
                <span
                  key={spec}
                  className="px-2.5 py-0.5 rounded-full bg-surface-sunken text-[11px] text-muted-foreground border border-border/25"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Banner de Próxima Sesión */}
          {appointment && <NextSessionBanner appointment={appointment} />}

          {/* Control de Diario Compartido */}
          <div className="p-5 rounded-3xl bg-surface-raised border border-border/40 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-replica text-base font-medium text-foreground">
                {diaryShare.title}
              </h3>

              {/* Interruptor toggle suave */}
              <button
                type="button"
                role="switch"
                aria-checked={isSharingDiary}
                aria-label={diaryShare.toggleAria}
                onClick={handleToggleDiaryShare}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                  isSharingDiary ? "bg-voice" : "bg-surface-sunken border border-border/40"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-surface-raised block shadow-xs transition-transform duration-200 ${
                    isSharingDiary ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <p className="font-voice text-xs text-muted-foreground leading-relaxed">
              {diaryShare.description}
            </p>

            <div className="p-2.5 rounded-xl bg-surface-sunken border border-border/30 flex items-center gap-2">
              <Lock size={12} className="text-voice shrink-0" />
              <span className="text-[11px] text-subtle leading-tight">
                {diaryShare.privateShield}
              </span>
            </div>
          </div>
        </aside>

        {/* Columna Principal / Conversación de Chat */}
        <div className="min-w-0 space-y-4 flex flex-col h-[75vh] min-h-[520px] bg-surface-raised rounded-3xl border border-border/40 shadow-raised p-4 sm:p-6">
          {/* Cabecera del Chat */}
          <div className="flex items-center justify-between pb-3 border-b border-border/20 select-none shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-voice-soft text-voice font-semibold flex items-center justify-center text-sm shadow-xs border border-border/30">
                {psychologist.initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-replica text-lg font-medium text-foreground">
                    {psychologist.name}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-voice inline-block" />
                </div>
                <span className="text-xs text-subtle font-voice block">
                  {header.statusOnline} · {psychologist.title}
                </span>
              </div>
            </div>

            {appointment && (
              <a
                href={appointment.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir Google Meet"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-voice-soft hover:opacity-90 text-voice text-xs font-semibold transition-opacity"
              >
                <Video size={14} />
                <span>Meet</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>

          {/* Historial de Mensajes con Scroll */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                psychologistInitials={psychologist.initials}
              />
            ))}

            {isTyping && (
              <TypingIndicator psychologistName={psychologist.name.split(" ")[0]} />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Barra de entrada de texto e interacción */}
          <div className="shrink-0 pt-2 border-t border-border/20">
            <ChatInput
              onSend={handleSendMessage}
              onOpenShareNote={() => setIsShareNoteOpen(true)}
              disabled={isTyping}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
