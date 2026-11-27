/**
 * Location service for reverse geocoding coordinates to human-readable address
 * and calculating emergency distances.
 */

// Simple in-memory cache to respect OpenStreetMap Nominatim rate limits (1 req/sec)
const geocodeCache = new Map();

export const locationService = {
  /**
   * Reverse geocode latitude and longitude into physical address
   */
  async reverseGeocode(latitude, longitude) {
    if (!latitude || !longitude) {
      return 'Coordinates not available';
    }

    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    if (geocodeCache.has(cacheKey)) {
      return geocodeCache.get(cacheKey);
    }

    try {
      // Use OpenStreetMap Nominatim reverse geocoding API
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SafeVoice-SafeHer-EmergencyApp/1.0 (contact: support@safeher.org)',
          'Accept-Language': 'en',
        },
      });

      if (!response.ok) {
        return `Latitude: ${latitude.toFixed(5)}, Longitude: ${longitude.toFixed(5)}`;
      }

      const data = await response.json();
      const displayName = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      geocodeCache.set(cacheKey, displayName);
      return displayName;
    } catch (error) {
      console.warn('[SafeVoice Location Service] Geocode lookup fallback:', error.message);
      return `Latitude: ${latitude.toFixed(5)}, Longitude: ${longitude.toFixed(5)}`;
    }
  },

  /**
   * Calculate distance between two coordinates in meters (Haversine Formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in meters
  },
};
