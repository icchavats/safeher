import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export const SOSButton = ({ onTrigger, isAlertActive = false, disabled = false }) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-6">
      {/* Background glowing rings */}
      <div className={`absolute w-64 h-64 md:w-80 md:h-80 rounded-full transition-all duration-700 pointer-events-none ${
        isAlertActive 
          ? 'bg-rose-600/30 animate-ping-slow' 
          : 'bg-rose-500/15 animate-pulse'
      }`} />
      <div className={`absolute w-52 h-52 md:w-64 md:h-64 rounded-full transition-all duration-500 pointer-events-none ${
        isAlertActive 
          ? 'bg-red-600/40 animate-pulse-fast' 
          : 'bg-rose-600/20'
      }`} />

      {/* Main SOS Trigger Button */}
      <button
        onClick={() => onTrigger({ triggerType: 'manual_sos' })}
        disabled={disabled}
        aria-label="Emergency SOS Button"
        className={`relative z-10 w-44 h-44 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center text-white font-extrabold shadow-2xl transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-rose-500/50 ${
          isAlertActive
            ? 'bg-gradient-to-tr from-red-700 via-rose-600 to-red-500 ring-8 ring-red-500/40 shadow-red-500/50'
            : 'bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 hover:from-rose-600 hover:to-red-500 hover:scale-105 shadow-rose-900/60'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-1">
          {isAlertActive ? (
            <ShieldAlert className="w-12 h-12 md:w-16 md:h-16 animate-bounce text-white drop-shadow" />
          ) : (
            <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow" />
          )}
          <span className="text-3xl md:text-4xl tracking-widest font-black drop-shadow-md">
            {isAlertActive ? 'ACTIVE' : 'SOS'}
          </span>
          <span className="text-xs tracking-wider uppercase opacity-90 font-medium">
            {isAlertActive ? 'DISPATCHED' : 'TAP FOR HELP'}
          </span>
        </div>
      </button>

      <p className="mt-6 text-sm text-slate-400 text-center max-w-xs">
        {isAlertActive 
          ? '⚠️ Emergency alert is broadcasting live location to your contacts!' 
          : 'Press to initiate instant emergency dispatch with 5s cancel window'}
      </p>
    </div>
  );
};
