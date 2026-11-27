import React from 'react';
import { Mic, MicOff, Volume2, ShieldCheck } from 'lucide-react';

export const ListeningStatus = ({
  isListening = true,
  decibels = 0,
  lastTranscript = '',
  lastKeyword = null,
  onToggle = () => {},
  isSupported = true,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 md:p-5 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border ${
            isListening 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}>
            {isListening ? (
              <Mic className="w-6 h-6 animate-pulse text-rose-500" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-base">
                Voice Distress Sentinel
              </h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                isListening
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isListening ? 'MONITORING' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Listening for keywords like <span className="text-rose-400 font-medium">"Help"</span>, <span className="text-rose-400 font-medium">"Bachao"</span>, or distress screams
            </p>
          </div>
        </div>

        {/* Toggle Listening Button */}
        <button
          onClick={onToggle}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
            isListening
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-900/40'
          }`}
        >
          {isListening ? 'Pause Detection' : 'Enable Detection'}
        </button>
      </div>

      {/* Decibel audio level visualizer */}
      {isListening && (
        <div className="mt-4 pt-3 border-t border-slate-800/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Ambient Sound:</span>
            <div className="w-28 md:w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  decibels > 80 ? 'bg-rose-500' : decibels > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, decibels)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-300">{decibels} dB</span>
          </div>

          {/* Sound waves animation */}
          <div className="flex items-center gap-1 h-6">
            <div className="w-1 bg-rose-500 rounded-full animate-wave-1" />
            <div className="w-1 bg-rose-400 rounded-full animate-wave-2" />
            <div className="w-1 bg-rose-500 rounded-full animate-wave-3" />
            <div className="w-1 bg-rose-400 rounded-full animate-wave-4" />
            <div className="w-1 bg-rose-500 rounded-full animate-wave-5" />
          </div>

          {lastTranscript && (
            <p className="text-xs text-slate-400 truncate max-w-xs italic">
              Heard: "{lastTranscript}"
            </p>
          )}
        </div>
      )}

      {!isSupported && (
        <p className="mt-2 text-xs text-amber-400">
          ⚠️ Speech Recognition is best supported on Chrome, Edge, and Android browsers.
        </p>
      )}
    </div>
  );
};
