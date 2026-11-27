import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { alertService } from '../services/alertService';
import { useAuth } from './AuthContext';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [activeAlert, setActiveAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [pendingTrigger, setPendingTrigger] = useState(null);
  const [location, setLocation] = useState(null);
  const [isListeningActive, setIsListeningActive] = useState(true);

  // Poll or fetch active alert on login
  const checkActiveAlert = useCallback(async () => {
    if (!isAuthenticated) {
      setActiveAlert(null);
      return;
    }
    try {
      const res = await alertService.getActiveAlert();
      if (res.success && res.hasActiveAlert) {
        setActiveAlert(res.alert);
      } else {
        setActiveAlert(null);
      }
    } catch (err) {
      console.warn('[SafeVoice AlertContext] Error checking active alert:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkActiveAlert();
  }, [checkActiveAlert]);

  // Execute actual SOS dispatch
  const executeSOS = async (triggerData) => {
    setLoading(true);
    try {
      const payload = {
        triggerType: triggerData?.triggerType || 'manual_sos',
        keywordTriggered: triggerData?.keywordTriggered || '',
        audioDecibels: triggerData?.audioDecibels || null,
        location: triggerData?.location || location || {
          latitude: 28.6139,
          longitude: 77.2090,
          accuracy: 15,
        },
      };

      const res = await alertService.triggerAlert(payload);
      if (res.success) {
        setActiveAlert(res.alert);
        setIsCountingDown(false);
        setPendingTrigger(null);
        return res.alert;
      }
    } catch (error) {
      console.error('[SafeVoice SOS Dispatch Failed]:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Start emergency countdown modal before triggering
  const initiateSOS = (triggerData = {}) => {
    setPendingTrigger(triggerData);
    setIsCountingDown(true);
  };

  // Immediate SOS (bypassing countdown)
  const triggerImmediateSOS = async (triggerData = {}) => {
    setIsCountingDown(false);
    return await executeSOS(triggerData);
  };

  // Abort emergency countdown
  const abortCountdown = () => {
    setIsCountingDown(false);
    setPendingTrigger(null);
  };

  // Cancel active alert with emergency PIN
  const cancelActiveAlert = async (pin, phrase, reason) => {
    if (!activeAlert) return;
    setLoading(true);
    try {
      const res = await alertService.cancelAlert(activeAlert._id, { pin, phrase, reason });
      if (res.success) {
        setActiveAlert(null);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertContext.Provider
      value={{
        activeAlert,
        isAlertActive: Boolean(activeAlert && activeAlert.status === 'active'),
        loading,
        isCountingDown,
        pendingTrigger,
        location,
        setLocation,
        isListeningActive,
        setIsListeningActive,
        initiateSOS,
        triggerImmediateSOS,
        executeSOS,
        abortCountdown,
        cancelActiveAlert,
        refreshActiveAlert: checkActiveAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
