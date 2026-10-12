import { useCallback, useEffect, useRef, useState } from "react";

// Dictado con la Web Speech API (Chrome y Edge). Misma forma que el hook de la app
// (features/journal/hooks/use-dictation.ts): el texto llega por tramos y `isFinal` dice si ese tramo
// ya no va a cambiar. Los parciales se muestran aparte y solo los finales se suman a la nota.

export type DictationState = "idle" | "starting" | "listening" | "denied" | "unavailable" | "error";

// Lo justo de la Web Speech API que usamos (TypeScript no la trae en sus tipos del DOM).
interface SpeechAlternative {
  transcript: string;
}
interface SpeechResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechAlternative;
}
interface SpeechResultList {
  readonly length: number;
  [index: number]: SpeechResult;
}
interface SpeechResultEvent {
  readonly resultIndex: number;
  readonly results: SpeechResultList;
}
interface SpeechErrorEvent {
  readonly error: string;
}
interface SpeechRecognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognizerConstructor = new () => SpeechRecognizer;

function recognizerClass(): SpeechRecognizerConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognizerConstructor;
    webkitSpeechRecognition?: SpeechRecognizerConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// El español del navegador si lo es; si no, una variante latinoamericana.
function dictationLang() {
  const lang = typeof navigator !== "undefined" ? navigator.language : "";
  return lang.toLowerCase().startsWith("es") ? lang : "es-MX";
}

interface Options {
  onTranscript: (text: string, isFinal: boolean) => void;
}

export function useDictation({ onTranscript }: Options) {
  const [supported] = useState(() => recognizerClass() !== null);
  const [state, setState] = useState<DictationState>("idle");
  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const start = useCallback(() => {
    const Recognizer = recognizerClass();
    if (!Recognizer) {
      setState("unavailable");
      return;
    }
    recognizerRef.current?.abort();

    const recognizer = new Recognizer();
    recognizer.lang = dictationLang();
    recognizer.continuous = true;
    recognizer.interimResults = true;

    recognizer.onstart = () => setState("listening");
    recognizer.onend = () => {
      if (recognizerRef.current === recognizer) recognizerRef.current = null;
      setState((s) => (s === "listening" || s === "starting" ? "idle" : s));
    };
    recognizer.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          if (transcript.trim()) onTranscriptRef.current(transcript.trim(), true);
        } else {
          interim += transcript;
        }
      }
      onTranscriptRef.current(interim.trim(), false);
    };
    recognizer.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") {
        setState("idle");
      } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setState("denied");
      } else if (event.error === "audio-capture" || event.error === "language-not-supported") {
        setState("unavailable");
      } else {
        setState("error");
      }
    };

    recognizerRef.current = recognizer;
    setState("starting");
    try {
      recognizer.start();
    } catch {
      recognizerRef.current = null;
      setState("error");
    }
  }, []);

  const stop = useCallback(() => {
    recognizerRef.current?.stop();
  }, []);

  const reset = useCallback(() => setState("idle"), []);

  // Al salir de la pantalla, el micrófono se apaga.
  useEffect(() => () => recognizerRef.current?.abort(), []);

  return { supported, state, start, stop, reset };
}
