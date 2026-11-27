import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider, useAlert } from './context/AlertContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { CountdownModal } from './components/CountdownModal';
import { Database } from 'lucide-react';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { AlertHistory } from './pages/AlertHistory';
import { Analytics } from './pages/Analytics';
import { Safety } from './pages/Safety';
import { GuardianMonitor } from './pages/GuardianMonitor';

const GlobalEmergencyModal = () => {
  const { isCountingDown, pendingTrigger, executeSOS, abortCountdown } = useAlert();

  return (
    <CountdownModal
      isOpen={isCountingDown}
      triggerData={pendingTrigger}
      onConfirm={(data) => executeSOS(data)}
      onCancel={abortCountdown}
    />
  );
};

const DatabaseStatusBanner = () => {
  const { dbOffline } = useAuth();
  if (!dbOffline) return null;

  return (
    <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
      <Database className="w-3.5 h-3.5 text-amber-400" />
      <span>
        <strong>Database Offline:</strong> MongoDB is not running locally. Please add your free MongoDB Atlas connection string in <code className="bg-slate-900 px-1 py-0.5 rounded font-mono text-amber-300">backend/.env</code>.
      </span>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <DatabaseStatusBanner />
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Guardian Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/contacts"
                  element={
                    <ProtectedRoute>
                      <Contacts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alerts"
                  element={
                    <ProtectedRoute>
                      <AlertHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/safety"
                  element={
                    <ProtectedRoute>
                      <Safety />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/guardian"
                  element={
                    <ProtectedRoute>
                      <GuardianMonitor />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global SOS 5-second cancel countdown modal */}
            <GlobalEmergencyModal />
          </div>
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
