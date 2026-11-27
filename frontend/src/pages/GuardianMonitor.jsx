import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BellRing,
  Volume2,
  VolumeX,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { alertService } from '../services/alertService';
import { TRIGGER_TYPES } from '../utils/constants';
import { getMapsUrl } from '../utils/mapsLink';

export const GuardianMonitor = () => {
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const [isTestingSiren, setIsTestingSiren] = useState(false);
  const [error, setError] = useState(null);

  const audioCtxRef = useRef(null);
  const sirenIntervalRef = useRef(null);
  const isHighToneRef = useRef(false);

  const ensureAudioContext = useCallback(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq, duration = 0.25, volume = 0.35, type = 'sawtooth') => {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio blocked until user gesture
    }
  }, [ensureAudioContext]);

  const stopSiren = useCallback(() => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
  }, []);

  const startSiren = useCallback(() => {
    if (sirenIntervalRef.current) return;
    const pulse = () => {
      isHighToneRef.current = !isHighToneRef.current;
      playTone(isHighToneRef.current ? 1175 : 880, 0.32, 0.45, 'sawtooth');
    };
    pulse();
    sirenIntervalRef.current = setInterval(pulse, 350);
  }, [playTone]);

  // One-tap unlock for mobile browsers
  const handleEnableAlarm = () => {
    ensureAudioContext();
    playTone(587, 0.12, 0.2, 'sine');
    setTimeout(() => playTone(880, 0.18, 0.2, 'sine'), 120);
    setAlarmEnabled(true);
    setIsMuted(false);
  };

  const handleTestSiren = () => {
    if (!alarmEnabled) {
      handleEnableAlarm();
    }
    setIsTestingSiren(true);
    startSiren();
    setTimeout(() => {
      if (!activeAlert) {
        stopSiren();
      }
      setIsTestingSiren(false);
    }, 2000);
  };

  const checkActiveAlert = useCallback(async () => {
    try {
      const res = await alertService.getActiveAlert();
      setLastChecked(new Date());
      setError(null);
      if (res.success && res.hasActiveAlert) {
        setActiveAlert(res.alert);
      } else {
        setActiveAlert(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reach SafeVoice server');
    }
  }, []);

  // Poll every 3 seconds
  useEffect(() => {
    if (!isPolling) return;
    checkActiveAlert();
    const id = setInterval(checkActiveAlert, 3000);
    return () => clearInterval(id);
  }, [isPolling, checkActiveAlert]);

  // Control siren based on active alert + alarm state
  useEffect(() => {
    if (activeAlert && alarmEnabled && !isMuted) {
      startSiren();
    } else if (!isTestingSiren) {
      stopSiren();
    }
  }, [activeAlert, alarmEnabled, isMuted, isTestingSiren, startSiren, stopSiren]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSiren();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopSiren]);

  const triggerInfo = activeAlert
    ? TRIGGER_TYPES[activeAlert.triggerType] || TRIGGER_TYPES.manual_sos
    : null;

  const mapsLink = activeAlert?.location?.mapsUrl ||
    (activeAlert?.location?.latitude && activeAlert?.location?.longitude
      ? getMapsUrl(activeAlert.location.latitude, activeAlert.location.longitude)
      : null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Radio className="w-7 h-7 text-rose-500 animate-pulse" />
            <span>Guardian Live Monitor (Phone B)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Keep this screen open on a guardian&apos;s phone to sound an instant alarm and track live GPS when SOS is triggered
          </p>
        </div>

        <button
          onClick={() => setIsPolling((prev) => !prev)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 self-start sm:self-auto ${
            isPolling
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin' : ''}`} />
          <span>{isPolling ? 'Live Polling (3s)' : 'Polling Paused'}</span>
        </button>
      </div>

      {/* One-Tap Browser Audio Unlock Card */}
      <div className={`rounded-3xl p-6 border shadow-xl transition ${
        alarmEnabled
          ? 'bg-emerald-950/30 border-emerald-500/40'
          : 'bg-amber-950/30 border-amber-500/50'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl border flex-shrink-0 ${
              alarmEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
            }`}>
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {alarmEnabled ? 'Guardian Alarm Armed & Audio Unlocked' : 'Tap Once to Enable Guardian Alarm'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {alarmEnabled
                  ? 'Browser audio is unlocked. If an SOS alert arrives, this phone will immediately sound a loud emergency siren.'
                  : 'Mobile browsers block automatic loud audio until you interact with the page. Tap the button to unlock alarm sound on this device.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {!alarmEnabled ? (
              <button
                onClick={handleEnableAlarm}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>Enable Guardian Alarm</span>
              </button>
            ) : (
              <button
                onClick={handleTestSiren}
                disabled={isTestingSiren}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4 text-rose-400" />
                <span>{isTestingSiren ? 'Testing...' : 'Test Siren (2s)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs text-rose-300">
          ⚠️ {error}
        </div>
      )}

      {/* Active SOS Alert Display OR Safe Standby */}
      {activeAlert ? (
        <div className="bg-red-950/75 border-2 border-red-500 rounded-3xl p-6 md:p-8 shadow-2xl shadow-red-950/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-red-500/30">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg animate-bounce">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-full tracking-wider uppercase animate-pulse mb-1">
                  LIVE SOS EMERGENCY
                </span>
                <h2 className="text-xl font-black text-white">
                  {triggerInfo.label}
                </h2>
              </div>
            </div>

            {alarmEnabled && (
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  isMuted
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-white hover:bg-slate-100 text-red-700'
                }`}
              >
                {isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{isMuted ? 'Unmute Siren' : 'Mute Siren'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950/60 border border-red-500/30 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-red-300 font-semibold">
                <Clock className="w-4 h-4" />
                <span>Triggered At</span>
              </div>
              <p className="text-white font-mono text-sm">
                {new Date(activeAlert.createdAt).toLocaleString()}
              </p>
              {activeAlert.keywordTriggered && (
                <p className="text-amber-300">
                  Keyword: <strong>&quot;{activeAlert.keywordTriggered}&quot;</strong>
                </p>
              )}
              {activeAlert.audioDecibels && (
                <p className="text-amber-300">
                  Peak Sound: <strong>{activeAlert.audioDecibels} dB</strong>
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-950/60 border border-red-500/30 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-red-300 font-semibold">
                <MapPin className="w-4 h-4" />
                <span>Live Location</span>
              </div>
              <p className="text-white font-medium">
                {activeAlert.location?.address || 'Coordinates received'}
              </p>
              {activeAlert.location?.latitude && (
                <p className="text-slate-300 font-mono text-[11px]">
                  {activeAlert.location.latitude.toFixed(5)}, {activeAlert.location.longitude.toFixed(5)}
                </p>
              )}
            </div>
          </div>

          {mapsLink && (
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 bg-white hover:bg-slate-100 text-red-700 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>OPEN LIVE LOCATION IN GOOGLE MAPS</span>
            </a>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">All Clear — Monitoring Active</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No active SOS emergency right now. This screen checks every 3 seconds and will trigger the alarm automatically if an SOS is sent.
          </p>
          {lastChecked && (
            <p className="text-[11px] font-mono text-slate-500">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
