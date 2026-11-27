export const getMapsUrl = (lat, lng) => {
  if (!lat || !lng) return '#';
  return `https://www.google.com/maps?q=${lat},${lng}`;
};

export const getDirectionsUrl = (lat, lng) => {
  if (!lat || !lng) return '#';
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};

export const formatCoords = (lat, lng) => {
  if (!lat || !lng) return 'Coordinates unavailable';
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
};
