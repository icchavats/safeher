import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Web Audio API hook to detect loud distress screams and volume spikes (>80dB)
 */
export const useAudioDetection = ({ enabled = true, threshold = 85, onScreamDetected = () => {} }) => {
  const [decibels, setDecibels] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const spikeCountRef = useRef(0);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      micStreamRef.current = stream;
      setIsListening(true);
      setError(null);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const analyze = () => {
        analyser.getByteFrequencyData(dataArray);

        // Compute RMS sound energy
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / bufferLength);

        // Scale RMS to approximate dB value (0 to 100 scale)
        const currentDb = Math.min(100, Math.round((rms / 255) * 100 * 1.5));
        setDecibels(currentDb);

        // Scream detection: sustained high dB over consecutive frames
        if (currentDb >= threshold) {
          spikeCountRef.current += 1;
          if (spikeCountRef.current >= 4) {
            onScreamDetected({ decibels: currentDb });
            spikeCountRef.current = 0;
          }
        } else {
          spikeCountRef.current = Math.max(0, spikeCountRef.current - 1);
        }

        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (err) {
      console.warn('[SafeVoice Audio Detection Error]:', err.message);
      setError(err.message);
      setIsListening(false);
    }
  }, [threshold, onScreamDetected]);

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    setIsListening(false);
    setDecibels(0);
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
    decibels,
    error,
    startListening,
    stopListening,
    isSupported: Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
  };
};
