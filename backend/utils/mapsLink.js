/**
 * Formats location coordinates into interactive Google Maps & OpenStreetMap links
 */
export const generateMapsLink = (latitude, longitude) => {
  if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
    return 'Location coordinates unavailable';
  }
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

export const generateDirectionsLink = (latitude, longitude) => {
  if (!latitude || !longitude) return '';
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
};

export const formatCoordinates = (latitude, longitude) => {
  if (latitude === undefined || longitude === undefined) return 'N/A';
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lngDir = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(latitude).toFixed(5)}° ${latDir}, ${Math.abs(longitude).toFixed(5)}° ${lngDir}`;
};
