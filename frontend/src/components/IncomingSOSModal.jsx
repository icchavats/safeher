import React from 'react';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  ExternalLink,
  Volume2,
  VolumeX,
  Clock,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { TRIGGER_TYPES } from '../utils/constants';
import { getMapsUrl } from '../utils/mapsLink';
import { getEvidenceAudioUrl } from '../services/api';

export const IncomingSOSModal = () => {
  const {
    incomingAlerts,
    mutedAlertIds,
    sirenBlockedByBrowser,
    toggleMuteIncomingAlert,
    unlockAndPlaySiren,
    dismissIncomingAlert,
  } = useAlert();

  if (!incomingAlerts || incomingAlerts.length === 0) return null;

  const alert = incomingAlerts[0];
  const isMuted = mutedAlertIds.includes(alert._id);
  const triggerInfo = TRIGGER_TYPES[alert.triggerType] || TRIGGER_TYPES.manual_sos;
  const sender = alert.user || {};

  const mapsLink =
    alert.location?.mapsUrl ||
    (alert.location?.latitude && alert.location?.longitude
      ? getMapsUrl(alert.location.latitude, alert.location.longitude)
      : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-950 border-2 border-red-500 rounded-3xl p-6 md:p-8 shadow-2xl shadow-red-950 space-y-5 my-auto">
        {/* Urgent Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-red-500/30">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg animate-bounce flex-shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-full tracking-wider uppercase animate-pulse mb-1">
                {alert.triggerType === 'test_alert' ? 'TEST SOS ALERT' : 'INCOMING SOS EMERGENCY'}
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                {sender.name || 'Emergency Contact'} Needs Help!
              </h2>
              <p className="text-xs text-red-300 mt-0.5 font-medium">
                {triggerInfo.label}
              </p>
            </div>
          </div>

          <button
            onClick={() => dismissIncomingAlert(alert._id)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Autoplay Unlock Prompt (if browser blocked automatic audio) */}
        {sirenBlockedByBrowser && !isMuted && (
          <button
            onClick={unlockAndPlaySiren}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 animate-pulse transition"
          >
            <Volume2 className="w-5 h-5" />
            <span>TAP HERE TO SOUND LOUD SIREN</span>
          </button>
        )}

        {/* Sender & Trigger Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="p-4 bg-slate-900 border border-red-500/30 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-red-300 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Person in Distress</span>
            </div>
            <p className="text-white font-bold text-sm">{sender.name || 'SafeVoice User'}</p>
            {sender.phone && (
              <p className="text-slate-300 font-mono">{sender.phone}</p>
            )}
            {sender.email && (
              <p className="text-slate-400 truncate">{sender.email}</p>
            )}
          </div>

          <div className="p-4 bg-slate-900 border border-red-500/30 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-red-300 font-semibold">
              <Clock className="w-4 h-4" />
              <span>Alert Timestamp</span>
            </div>
            <p className="text-white font-mono text-sm">
              {new Date(alert.createdAt).toLocaleString()}
            </p>
            {alert.keywordTriggered && (
              <p className="text-amber-300">
                Detected Word: <strong>&quot;{alert.keywordTriggered}&quot;</strong>
              </p>
            )}
            {alert.audioDecibels && (
              <p className="text-amber-300">
                Sound Level: <strong>{alert.audioDecibels} dB</strong>
              </p>
            )}
          </div>
        </div>

        {/* Live GPS Location */}
        <div className="p-4 bg-slate-900 border border-red-500/30 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-red-300 font-semibold">
            <MapPin className="w-4 h-4" />
            <span>Live GPS Location</span>
          </div>
          <p className="text-white font-medium text-sm">
            {alert.location?.address || 'Coordinates acquired'}
          </p>
          {alert.location?.latitude && alert.location?.longitude && (
            <p className="text-slate-400 font-mono text-[11px]">
              {alert.location.latitude.toFixed(5)}, {alert.location.longitude.toFixed(5)}
              {alert.location.accuracy ? ` (Accuracy ~${alert.location.accuracy}m)` : ''}
            </p>
          )}
        </div>

        {/* Audio Evidence if available */}
        {alert.audioEvidence && alert.audioEvidence.length > 0 && (
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <p className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" />
              <span>Recorded Ambient Audio Evidence</span>
            </p>
            <audio
              controls
              src={getEvidenceAudioUrl(alert.audioEvidence[0].filename)}
              className="w-full h-9"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {mapsLink && (
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-white hover:bg-slate-100 text-red-700 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>OPEN IN GOOGLE MAPS</span>
            </a>
          )}

          {sender.phone && (
            <a
              href={`tel:${sender.phone}`}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>CALL {sender.name?.split(' ')[0]?.toUpperCase() || 'NOW'}</span>
            </a>
          )}
        </div>

        {/* Siren & Dismiss Controls */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={() => toggleMuteIncomingAlert(alert._id)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              isMuted
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{isMuted ? 'Unmute Siren' : 'Mute Siren'}</span>
          </button>

          <button
            onClick={() => dismissIncomingAlert(alert._id)}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            Acknowledge & Dismiss
          </button>
        </div>

        {incomingAlerts.length > 1 && (
          <p className="text-center text-[11px] text-amber-300 font-semibold">
            +{incomingAlerts.length - 1} more active incoming SOS alert(s)
          </p>
        )}
      </div>
    </div>
  );
};
