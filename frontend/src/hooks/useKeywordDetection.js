import { useState, useEffect, useRef, useCallback } from 'react';
import { DISTRESS_KEYWORDS } from '../utils/constants';

/**
 * Web Speech Recognition hook to continuously listen for emergency wake-words:
 * "Help", "Bachao", "Save me", "Emergency", "Danger", "Police", "Chodo"
 */
export const useKeywordDetection = ({ enabled = true, keywords = DISTRESS_KEYWORDS, onKeywordDetected = () => {} }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastDetected, setLastDetected] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Also captures Hindi phonetics like bachao, madad

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }

        const cleaned = currentTranscript.trim().toLowerCase();
        setTranscript(cleaned);

        // Check if any emergency keyword is in spoken transcript
        for (const kw of keywords) {
          const lowerKw = kw.toLowerCase();
          if (cleaned.includes(lowerKw)) {
            setLastDetected({ keyword: kw, timestamp: Date.now() });
            onKeywordDetected(kw);
            break;
          }
        }
      };

      recognition.onerror = (event) => {
        // 'no-speech' is expected when user is silent
        if (event.error !== 'no-speech') {
          console.warn('[SafeVoice SpeechRecognition Error]:', event.error);
        }
      };

      recognition.onend = () => {
        // Auto-restart if still enabled
        if (enabledRef.current) {
          try {
            recognition.start();
          } catch {}
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('[SafeVoice Speech Start Error]:', err.message);
      setIsListening(false);
    }
  }, [keywords, onKeywordDetected]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      startListening();
    } else {
      stopListening();
    }

    return () => {
      stopListening();
    };
  }, [enabled, startListening, stopListening]);

  return {
    isListening,
    transcript,
    lastDetected,
    isSupported,
    startListening,
    stopListening,
  };
};
