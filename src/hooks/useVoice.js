/**
 * useVoice.js — Custom hook wrapping the Web Speech API
 * Handles microphone recording and real-time transcript updates.
 */

import { useState, useRef, useCallback } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export function useVoice() {
  const [listening,   setListening]   = useState(false);
  const [transcript,  setTranscript]  = useState("");
  const [error,       setError]       = useState(null);
  const recognitionRef = useRef(null);

  const supported = !!SpeechRecognition;

  const startListening = useCallback(() => {
    if (!supported) {
      setError("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    setError(null);
    setTranscript("");

    const recognition = new SpeechRecognition();
    recognition.lang              = "en-IN"; // Changed to handle Indian accents better as well
    recognition.interimResults    = true;
    recognition.maxAlternatives   = 1;
    recognition.continuous        = false; // Stop after a single command

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let interim = "";
      let final   = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(final || interim);
    };

    recognition.onerror = (event) => {
      setError(`Microphone error: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [supported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const clearTranscript = useCallback(() => setTranscript(""), []);

  return { listening, transcript, error, supported, startListening, stopListening, clearTranscript };
}
