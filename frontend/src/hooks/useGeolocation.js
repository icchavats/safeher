import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to continuously track high-accuracy GPS coordinates
 */
export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000,
    ...options,
  };

  const handleSuccess = useCallback((position) => {
    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: Math.round(position.coords.accuracy),
      speed: position.coords.speed || 0,
      heading: position.coords.heading || 0,
      timestamp: position.timestamp,
    };
    setLocation(coords);
    setError(null);
    setLoading(false);
  }, []);

  const handleError = useCallback((err) => {
    console.warn(`[SafeVoice Geolocation Error (${err.code})]: ${err.message}`);
    // Provide sensible default location if blocked (e.g. user denied or localhost insecure)
    // New Delhi default center
    setLocation((prev) => prev || {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 25,
      isSimulated: true,
      timestamp: Date.now(),
    });
    setError(err.message);
    setLoading(false);
  }, []);

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, defaultOptions);
  }, [handleSuccess, handleError, defaultOptions]);

  useEffect(() => {
    if (!navigator.geolocation) {
      handleError({ code: 0, message: 'Geolocation is not supported' });
      return;
    }

    // Get immediate position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, defaultOptions);

    // Watch continuous updates
    const watcherId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      defaultOptions
    );

    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, [handleSuccess, handleError, defaultOptions]);

  return { location, error, loading, refreshLocation };
};
