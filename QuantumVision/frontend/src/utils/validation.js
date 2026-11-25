/**
 * Form and input validation utilities.
 */
export const isValidCoordinate = (lat, lon) => {
  const numLat = parseFloat(lat);
  const numLon = parseFloat(lon);
  return !isNaN(numLat) && !isNaN(numLon) && numLat >= -90 && numLat <= 90 && numLon >= -180 && numLon <= 180;
};

export const validateForm = (fields) => {
  const errors = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') {
      errors[key] = 'This field is required';
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};