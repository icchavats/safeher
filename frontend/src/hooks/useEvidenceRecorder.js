import { useState, useRef, useCallback } from 'react';
import { alertService } from '../services/alertService';

/**
 * Hook to automatically record ambient audio for 10-20 seconds upon emergency SOS
 * and upload it directly as forensic evidence.
 */
export const useEvidenceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [evidenceAudioUrl, setEvidenceAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startEvidenceRecording = useCallback(async (alertId = null, durationSeconds = 15) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      // Determine supported MIME format
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setEvidenceAudioUrl(url);

        // Upload evidence to backend
        try {
          const formData = new FormData();
          formData.append('evidenceAudio', audioBlob, `evidence-${Date.now()}.webm`);
          if (alertId) formData.append('alertId', alertId);
          formData.append('duration', durationSeconds);

          await alertService.uploadEvidence(formData);
          console.log('[SafeVoice Evidence] Audio evidence captured and securely uploaded');
        } catch (uploadErr) {
          console.error('[SafeVoice Evidence Upload Error]:', uploadErr);
        } finally {
          // Release microphone tracks
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
        }
      };

      recorder.start();
      setIsRecording(true);
      mediaRecorderRef.current = recorder;

      // Automatically stop after specified duration
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, durationSeconds * 1000);
    } catch (err) {
      console.warn('[SafeVoice Evidence Recording Error]:', err.message);
      setIsRecording(false);
    }
  }, []);

  const stopEvidenceRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    isRecording,
    evidenceAudioUrl,
    startEvidenceRecording,
    stopEvidenceRecording,
  };
};
