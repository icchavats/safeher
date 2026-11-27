import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Emergency countdown hook with siren tone audio beep effect
 */
export const useCountdown = (initialSeconds = 5, onComplete = () => {}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Play warning beep during countdown
  const playBeep = useCallback((frequency = 800, duration = 0.15) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio playback suppressed if user hasn't interacted
    }
  }, []);

  const start = useCallback(() => {
    setSeconds(initialSeconds);
    setIsActive(true);
    playBeep(950, 0.2);
  }, [initialSeconds, playBeep]);

  const stop = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setSeconds(initialSeconds);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsActive(false);
          // Trigger high pitch siren beep on zero
          playBeep(1200, 0.4);
          onComplete();
          return 0;
        }
        playBeep(850 + (initialSeconds - prev) * 80, 0.15);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isActive, initialSeconds, onComplete, playBeep]);

  return { seconds, isActive, start, stop, reset };
};
