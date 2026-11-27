import React from 'react';
import { AlertCircle, MapPin, ExternalLink, Clock, CheckCircle2, ShieldOff, Play, Volume2 } from 'lucide-react';
import { TRIGGER_TYPES } from '../utils/constants';
import { getEvidenceAudioUrl } from '../services/api';

export const AlertCard = ({ alert, onResolve }) => {
  const triggerInfo = TRIGGER_TYPES[alert.triggerType] || TRIGGER_TYPES.manual_sos;
  const isResolved = alert.status === 'resolved';
  const isCancelled = alert.status === 'cancelled';
  const isActive = alert.status === 'active';

  return (
    <div className={`border rounded-2xl p-5 shadow-lg backdrop-blur transition ${
      isActive
        ? 'bg-rose-950/40 border-rose-500/60 shadow-rose-950/50'
        : 'bg-slate-900/80 border-slate-800'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${triggerInfo.badgeClass}`}>
            {triggerInfo.label}
          </span>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isActive
              ? 'bg-red-500 text-white animate-pulse'
              : isCancelled
              ? 'bg-slate-800 text-slate-400'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {alert.status.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date(alert.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Location Details */}
      <div className="mt-3.5 space-y-2">
        <div className="flex items-start gap-2 text-xs text-slate-300">
          <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-200">
              {alert.location?.address || 'Coordinates acquired'}
            </p>
            {alert.location?.latitude && (
              <p className="font-mono text-slate-400 text-[11px] mt-0.5">
                {alert.location.latitude.toFixed(5)}, {alert.location.longitude.toFixed(5)} (Accuracy: {alert.location.accuracy || 15}m)
              </p>
            )}
          </div>
        </div>

        {alert.location?.mapsUrl && (
          <div className="pt-1">
            <a
              href={alert.location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
          </div>
        )}
      </div>

      {/* Audio Evidence Player if recorded */}
      {alert.audioEvidence && alert.audioEvidence.length > 0 && (
        <div className="mt-4 p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-rose-300">
              <Volume2 className="w-4 h-4" />
              <span>Audio Evidence Captured ({alert.audioEvidence.length} clips)</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {(alert.audioEvidence[0].size / 1024).toFixed(1)} KB
            </span>
          </div>
          <audio
            controls
            src={getEvidenceAudioUrl(alert.audioEvidence[0].filename)}
            className="w-full h-8"
          />
        </div>
      )}

      {/* Cancellation / Resolution reason note */}
      {alert.cancelReason && (
        <div className="mt-3 text-xs text-slate-400 italic bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
          Note: {alert.cancelReason}
        </div>
      )}

      {/* Dispatched recipients info */}
      {alert.recipientsNotified && alert.recipientsNotified.length > 0 && (
        <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-slate-300">Dispatched To:</span>
          {alert.recipientsNotified.map((rec, idx) => (
            <span key={idx} className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {rec.name} ({rec.status})
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {isActive && onResolve && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={() => onResolve(alert._id)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Incident as Resolved</span>
          </button>
        </div>
      )}
    </div>
  );
};
