import React, { useState, useEffect } from 'react';
import { alertService } from '../services/alertService';
import { AlertCard } from '../components/AlertCard';
import { History, Filter, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(''); // '' = all

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = filterStatus ? { status: filterStatus } : {};
      const res = await alertService.getAlertHistory(params);
      if (res.success) {
        setAlerts(res.alerts);
      }
    } catch (err) {
      console.error('Error fetching alerts history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterStatus]);

  const handleResolveAlert = async (id) => {
    try {
      await alertService.resolveAlert(id, 'Incident confirmed resolved by user');
      fetchHistory();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-rose-500" />
            <span>Emergency Incident Log & Evidence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of all triggered SOS alerts, audio recordings, and dispatches
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-2xl self-start sm:self-auto">
          {[
            { label: 'All Incidents', value: '' },
            { label: 'Active', value: 'active' },
            { label: 'Resolved', value: 'resolved' },
            { label: 'Cancelled', value: 'cancelled' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilterStatus(item.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterStatus === item.value
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Loading emergency history...
        </div>
      ) : alerts.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/60 border border-slate-800 rounded-3xl p-8">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-white mb-1">
            No {filterStatus ? filterStatus : ''} incidents recorded
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You are safe. Past emergency dispatches, audio evidence recordings, and dispatch logs will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert._id}
              alert={alert}
              onResolve={handleResolveAlert}
            />
          ))}
        </div>
      )}

    </div>
  );
};
