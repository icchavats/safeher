import React from 'react';
import { EMERGENCY_HELPLINES } from '../utils/constants';
import { Chatbot } from '../components/Chatbot';
import { PhoneCall, Shield, Scale, FileText, Lock, AlertCircle } from 'lucide-react';

export const Safety = () => {
  const legalProtections = [
    {
      title: 'Zero FIR Rights',
      description: 'You can register an FIR at ANY police station irrespective of jurisdictional limits. Refusal by an officer is a punishable offense under Sec 166A IPC.',
      badge: 'Section 154 CrPC',
    },
    {
      title: 'Right to Free Legal Aid',
      description: 'Under the Legal Services Authorities Act, women are entitled to free legal representation regardless of financial status or income.',
      badge: 'Free Representation',
    },
    {
      title: 'Virtual / Online Complaints',
      description: 'If unable to visit a station, women have the right to register complaints via email or registered post to a Senior Police Officer.',
      badge: 'Email & Post FIR',
    },
    {
      title: 'Right to Privacy during Statements',
      description: 'Statements by female survivors can only be recorded by or in the presence of a woman police officer at the survivor’s residence.',
      badge: 'Sec 164(5A) CrPC',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-rose-500" />
          <span>Safety Helplines, Legal Rights & Assistant</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          24/7 National Emergency Numbers, legal safeguards for women, and AI assistant
        </p>
      </div>

      {/* Helplines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EMERGENCY_HELPLINES.map((helpline) => (
          <div
            key={helpline.number}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-rose-500/40 transition group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-rose-500 group-hover:text-rose-400 transition">
                  {helpline.number}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                  {helpline.category}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-2">
                {helpline.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {helpline.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80">
              <a
                href={`tel:${helpline.number}`}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-rose-950/40"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {helpline.number} Now</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Legal Rights + Emergency AI Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Legal Rights Cards */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-rose-500" />
            <span>Essential Legal Protections</span>
          </h2>

          <div className="space-y-3.5">
            {legalProtections.map((item, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold text-white">{item.title}</h3>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Chatbot */}
        <div className="lg:col-span-7">
          <Chatbot />
        </div>

      </div>

    </div>
  );
};
