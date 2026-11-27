import React, { useState } from 'react';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAudioDetection } from '../hooks/useAudioDetection';
import { useKeywordDetection } from '../hooks/useKeywordDetection';
import { useEvidenceRecorder } from '../hooks/useEvidenceRecorder';
import { SOSButton } from '../components/SOSButton';
import { ListeningStatus } from '../components/ListeningStatus';
import { 
  MapPin, 
  ExternalLink, 
  PhoneCall, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Volume2, 
  RefreshCw,
  AlertOctagon
} from 'lucide-react';
import { EMERGENCY_HELPLINES } from '../utils/constants';

export const Dashboard = () => {
  const { user } = useAuth();
  const { 
    activeAlert, 
    isAlertActive, 
    initiateSOS, 
    triggerImmediateSOS,
    cancelActiveAlert,
    isListeningActive, 
    setIsListeningActive 
  } = useAlert();

  const { location, loading: geoLoading, refreshLocation } = useGeolocation();
  const { startEvidenceRecording, isRecording } = useEvidenceRecorder();

  const [cancelPin, setCancelPin] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Scream audio detection hook
  const { decibels, isSupported: audioSupported } = useAudioDetection({
    enabled: isListeningActive && !isAlertActive,
    threshold: user?.settings?.audioSensitivity ? (100 - user.settings.audioSensitivity + 50) : 85,
    onScreamDetected: ({ decibels: db }) => {
      console.warn('[SafeVoice] High decibel scream trigger detected:', db);
      initiateSOS({
        triggerType: 'scream_detected',
        audioDecibels: db,
        location,
      });
      // Start recording evidence
      if (user?.settings?.autoRecordAudio !== false) {
        startEvidenceRecording(activeAlert?._id, 15);
      }
    },
  });

  // Voice speech keyword detection hook
  const { transcript, lastDetected, isSupported: speechSupported } = useKeywordDetection({
    enabled: isListeningActive && !isAlertActive,
    keywords: user?.settings?.keywords || ['help', 'bachao', 'save me', 'emergency', 'police', 'danger'],
    onKeywordDetected: (kw) => {
      console.warn('[SafeVoice] Voice distress keyword detected:', kw);
      initiateSOS({
        triggerType: 'voice_keyword',
        keywordTriggered: kw,
        location,
      });
      if (user?.settings?.autoRecordAudio !== false) {
        startEvidenceRecording(activeAlert?._id, 15);
      }
    },
  });

  const handleManualTrigger = () => {
    initiateSOS({
      triggerType: 'manual_sos',
      location,
    });
    if (user?.settings?.autoRecordAudio !== false) {
      startEvidenceRecording(activeAlert?._id, 20);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelPin.trim()) {
      setCancelError('Please enter your emergency PIN');
      return;
    }

    try {
      await cancelActiveAlert(cancelPin, null, 'User confirmed safe via Dashboard');
      setCancelModalOpen(false);
      setCancelPin('');
      setCancelError('');
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Incorrect PIN. Alert remains active.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Active Emergency Banner */}
      {isAlertActive && (
        <div className="bg-red-950/80 border-2 border-red-500 rounded-3xl p-5 md:p-6 shadow-2xl shadow-red-950/80 animate-pulse">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg animate-bounce flex-shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-wide">
                  🚨 EMERGENCY SOS ALERT BROADCASTING!
                </h2>
                <p className="text-xs text-red-200 mt-1">
                  Your live location has been dispatched to emergency contacts and central channels.
                  {activeAlert?.location?.address && ` Current spot: ${activeAlert.location.address}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setCancelModalOpen(true)}
                className="flex-1 md:flex-none px-6 py-3 bg-white hover:bg-slate-100 text-red-700 font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>I AM SAFE (CANCEL WITH PIN)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: SOS Panic Button + Listening Sentinel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Big SOS Button & Emergency Helplines */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800/80 mb-2">
            <div>
              <h1 className="text-xl font-bold text-white">Emergency Panic Hub</h1>
              <p className="text-xs text-slate-400">Single tap activates instant emergency dispatch</p>
            </div>
            {isRecording && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>RECORDING EVIDENCE</span>
              </span>
            )}
          </div>

          {/* SOS Panic Button */}
          <SOSButton
            onTrigger={handleManualTrigger}
            isAlertActive={isAlertActive}
          />

          {/* Quick 1-Tap Helplines Call Bar */}
          <div className="w-full mt-6 pt-5 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Direct National Emergency Helplines
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {EMERGENCY_HELPLINES.slice(0, 3).map((helpline) => (
                <a
                  key={helpline.number}
                  href={`tel:${helpline.number}`}
                  className="p-3 bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 rounded-2xl flex flex-col items-center text-center transition group shadow"
                >
                  <span className="text-lg md:text-xl font-black text-rose-400 group-hover:text-rose-300">
                    {helpline.number}
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium truncate w-full mt-0.5">
                    {helpline.name.split(' ')[0]}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Voice Sentinel & Real-time Location Widget */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Voice Detection Component */}
          <ListeningStatus
            isListening={isListeningActive}
            decibels={decibels}
            lastTranscript={transcript}
            lastKeyword={lastDetected}
            onToggle={() => setIsListeningActive(!isListeningActive)}
            isSupported={speechSupported && audioSupported}
          />

          {/* Live Geolocation Widget */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live GPS Location</h3>
                  <p className="text-[11px] text-slate-400">Broadcasting coordinates with SOS</p>
                </div>
              </div>

              <button
                onClick={refreshLocation}
                disabled={geoLoading}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Refresh location"
              >
                <RefreshCw className={`w-4 h-4 ${geoLoading ? 'animate-spin text-rose-500' : ''}`} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/70">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Coordinates:</span>
                  <span className="text-emerald-400 font-medium">GPS Signal Active</span>
                </div>
                <p className="font-mono text-sm font-semibold text-white">
                  {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'Fetching location...'}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Accuracy: ~{location?.accuracy || 15}m</span>
                  <span>{location?.isSimulated ? '(Simulation mode)' : 'Hardware GPS'}</span>
                </div>
              </div>

              {location && (
                <a
                  href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                  <span>Open in Google Maps</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Safety Tip */}
          <div className="p-4 bg-gradient-to-r from-rose-950/30 to-purple-950/30 border border-rose-500/20 rounded-2xl text-xs text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">SafeVoice Tip:</span>
              Keep microphone listening enabled whenever walking alone at night or taking public transit.
            </div>
          </div>

        </div>

      </div>

      {/* Manual PIN Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Confirm You Are Safe
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your 4-digit Emergency PIN to terminate the SOS alert.
            </p>

            {cancelError && (
              <p className="text-xs text-rose-400 font-semibold mb-3">
                {cancelError}
              </p>
            )}

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={cancelPin}
                onChange={(e) => setCancelPin(e.target.value)}
                placeholder="Enter PIN (e.g. 1234)"
                className="w-full py-2.5 px-4 bg-slate-800 border border-slate-700 rounded-xl text-center text-white text-base tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setCancelModalOpen(false);
                    setCancelError('');
                  }}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-700 transition"
                >
                  Keep Active
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                >
                  Verify & Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
