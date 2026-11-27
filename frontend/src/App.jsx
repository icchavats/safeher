import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider, useAlert } from './context/AlertContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { CountdownModal } from './components/CountdownModal';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { AlertHistory } from './pages/AlertHistory';
import { Analytics } from './pages/Analytics';
import { Safety } from './pages/Safety';

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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
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
