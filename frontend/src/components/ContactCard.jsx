import React from 'react';
import { Phone, Mail, Send, Trash2, Edit2, ShieldCheck, ShieldAlert } from 'lucide-react';

export const ContactCard = ({ contact, onEdit, onDelete, onTestAlert }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">
                {contact.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Tier {contact.priority}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {contact.relation}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(contact)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Edit contact"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(contact._id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              title="Remove contact"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{contact.phone}</span>
          </div>
          {contact.email && (
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.isRegistered ? (
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SafeVoice Registered (Live Siren Ready)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-400/80">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Not registered on SafeVoice yet</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <a
          href={`tel:${contact.phone}`}
          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Call</span>
        </a>

        <button
          onClick={() => onTestAlert(contact._id)}
          className="flex-1 py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Send className="w-3.5 h-3.5 text-rose-400" />
          <span>Test SOS</span>
        </button>
      </div>
    </div>
  );
};
