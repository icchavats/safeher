import React, { useState, useEffect } from 'react';
import { alertService } from '../services/alertService';
import { 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  Mic, 
  Volume2, 
  Activity, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await alertService.getAnalytics();
        if (res.success) {
          setData(res.analytics);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-400 text-sm">
        Computing safety intelligence metrics...
      </div>
    );
  }

  const score = data?.preparednessScore || 50;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-rose-500" />
          <span>Safety Preparedness & Threat Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time metrics on safety readiness, trigger breakdowns, and incident response history
        </p>
      </div>

      {/* Top Readiness Score Card */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block mb-1">
            Readiness Index
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            {score >= 80 ? '🛡️ Optimum Protection Active' : score >= 50 ? '⚠️ Moderate Safety Readiness' : '⚠️ Action Needed to Secure Sentinel'}
          </h2>
          <p className="text-xs text-slate-300 mt-2 max-w-xl">
            {score >= 80
              ? 'Excellent! You have configured trusted emergency guardians, custom PIN authentication, and voice distress monitoring.'
              : 'Add at least 3 trusted contacts and configure your Telegram notifications to maximize emergency readiness.'}
          </p>
        </div>

        {/* Circular Score Gauge */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <div className="w-32 h-32 rounded-full border-8 border-slate-800 flex items-center justify-center bg-slate-950/60">
            <div className="text-center">
              <span className="text-3xl font-black text-rose-500">{score}%</span>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Prepared</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Total Alerts</span>
          <p className="text-2xl font-black text-white mt-1">{data?.totalAlerts || 0}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-red-400 font-semibold">Active Dispatches</span>
          <p className="text-2xl font-black text-red-500 mt-1">{data?.activeAlerts || 0}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-emerald-400 font-semibold">Resolved Safely</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{data?.resolvedAlerts || 0}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Cancelled (Safe)</span>
          <p className="text-2xl font-black text-slate-300 mt-1">{data?.cancelledAlerts || 0}</p>
        </div>
      </div>

      {/* Grid: Trigger Breakdown & 7-Day Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trigger Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" />
            <span>Triggers by Type</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Manual SOS Panic Button</span>
                <span className="font-mono">{data?.triggerBreakdown?.manual_sos || 0}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, ((data?.triggerBreakdown?.manual_sos || 0) / (data?.totalAlerts || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Voice Keywords ("Help / Bachao")</span>
                <span className="font-mono">{data?.triggerBreakdown?.voice_keyword || 0}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${Math.min(100, ((data?.triggerBreakdown?.voice_keyword || 0) / (data?.totalAlerts || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Distress Scream / Sound Decibels</span>
                <span className="font-mono">{data?.triggerBreakdown?.scream_detected || 0}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, ((data?.triggerBreakdown?.scream_detected || 0) / (data?.totalAlerts || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Activity Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-500" />
            <span>Last 7 Days Incident Activity</span>
          </h3>

          <div className="pt-4 flex items-end justify-between h-44 gap-2">
            {data?.last7Days?.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-28 bg-slate-800/40 rounded-xl p-1">
                  <div
                    className="w-full bg-gradient-to-t from-rose-600 to-pink-500 rounded-lg transition-all duration-500"
                    style={{ height: `${Math.max(8, Math.min(100, day.count * 30))}%` }}
                    title={`${day.count} alerts on ${day.date}`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-400">{day.day}</span>
                <span className="text-[10px] font-mono text-slate-500">{day.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
