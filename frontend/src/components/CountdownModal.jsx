import React, { useState } from 'react';
import { AlertCircle, ShieldOff, Zap, Lock } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { useAuth } from '../context/AuthContext';

export const CountdownModal = ({ isOpen, onConfirm, onCancel, triggerData }) => {
  const { user } = useAuth();
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { seconds, stop } = useCountdown(5, () => {
    onConfirm(triggerData);
  });

  if (!isOpen) return null;

  const handleCancelWithPin = (e) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMessage('Please enter your emergency PIN');
      return;
    }

    if (String(user?.emergencyPin).trim() === pinInput.trim()) {
      stop();
      onCancel();
    } else {
      setErrorMessage('Incorrect PIN. Emergency dispatch continuing.');
    }
  };

  const triggerLabel = {
    voice_keyword: `Voice Keyword: "${triggerData?.keywordTriggered || 'Help'}"`,
    scream_detected: `Loud Noise/Scream (${triggerData?.audioDecibels || 85} dB)`,
    manual_sos: 'Manual SOS Panic Button',
    fall_detected: 'Fall / Impact Detected',
  }[triggerData?.triggerType] || 'Emergency Trigger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 md:p-8 text-center shadow-2xl shadow-rose-950/80">
        
        {/* Pulsating header warning */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-full border border-rose-500/30 mb-4 animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>EMERGENCY DISPATCH INITIATED</span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
          Sending SOS in
        </h2>

        {/* Big countdown number */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border-4 border-rose-500/30 flex items-center justify-center bg-rose-950/40">
            <span className="text-6xl font-black text-rose-500 animate-pulse-fast">
              {seconds}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-300 font-medium mb-1">
          {triggerLabel}
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Your emergency contacts and Telegram channels will receive your live GPS coordinates.
        </p>

        {/* Cancel with PIN Form */}
        <form onSubmit={handleCancelWithPin} className="space-y-3 mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Enter Emergency PIN to cancel"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-center text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent tracking-widest font-mono"
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-400 font-medium animate-shake">
              {errorMessage}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <ShieldOff className="w-4 h-4 text-slate-400" />
              <span>Cancel (PIN)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stop();
                onConfirm(triggerData);
              }}
              className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-700/40 transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Send NOW</span>
            </button>
          </div>
        </form>

        <p className="text-[11px] text-slate-500">
          Default cancellation PIN is <span className="font-mono text-slate-400 font-semibold">{user?.emergencyPin || '1234'}</span> (changeable in Settings)
        </p>
      </div>
    </div>
  );
};
