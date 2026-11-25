/**
 * QuantumVision Global Formatting and Date/Time Utilities.
 * Strictly adheres to:
 * - Indian Standard Time (IST, Asia/Kolkata, UTC+5:30)
 * - Uniform Date Format: DD-MM-YYYY
 * - Uniform Timestamp Format: DD-MM-YYYY • hh:mm A IST
 */

// Time zone constant
export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns current Date in IST.
 */
export const getCurrentDateIST = () => new Date();

/**
 * Formats a Date or ISO string to DD-MM-YYYY in Indian Standard Time (IST).
 */
export const formatDateIST = (dateInput) => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // formatToParts gives {day, month, year}
  const parts = formatter.formatToParts(d);
  const day = parts.find((p) => p.type === 'day')?.value || '01';
  const month = parts.find((p) => p.type === 'month')?.value || '01';
  const year = parts.find((p) => p.type === 'year')?.value || '2026';

  return `${day}-${month}-${year}`;
};

/**
 * Formats a Date or ISO string to standard time string (hh:mm A IST).
 */
export const formatTimeIST = (dateInput, includeSeconds = false) => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const options = {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  if (includeSeconds) {
    options.second = '2-digit';
  }

  const timeStr = d.toLocaleTimeString('en-US', options);
  return `${timeStr} IST`;
};

/**
 * Formats full timestamp: DD-MM-YYYY • hh:mm A IST
 */
export const formatDateTimeIST = (dateInput) => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const dateStr = formatDateIST(d);
  const timeStr = formatTimeIST(d);
  return `${dateStr} • ${timeStr}`;
};

/**
 * Formats full timestamp for logs/audit: DD-MM-YYYY HH:mm:ss IST
 */
export const formatTimestampFullIST = (dateInput) => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const dateStr = formatDateIST(d);
  const timeStr = d.toLocaleTimeString('en-GB', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return `${dateStr} ${timeStr} IST`;
};

/**
 * Converts a Date to YYYY-MM-DD (backend format).
 */
export const toBackendDateStr = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Generates dynamic date ranges based on preset:
 * - 'today': today to today
 * - '7d': 7 days ago to today
 * - '30d': 30 days ago to today
 * - 'historical': start of available historical telemetry to today
 */
export const getDatePresetRange = (preset = '7d') => {
  const now = new Date();
  const todayStr = toBackendDateStr(now);

  if (preset === 'today') {
    return {
      id: 'today',
      label: 'Today',
      startDate: todayStr,
      endDate: todayStr,
      displayLabel: `Today (${formatDateIST(now)})`,
    };
  } else if (preset === '7d') {
    const past7 = new Date();
    past7.setDate(now.getDate() - 6);
    return {
      id: '7d',
      label: 'Last 7 Days',
      startDate: toBackendDateStr(past7),
      endDate: todayStr,
      displayLabel: `${formatDateIST(past7)} to ${formatDateIST(now)}`,
    };
  } else if (preset === '30d') {
    const past30 = new Date();
    past30.setDate(now.getDate() - 29);
    return {
      id: '30d',
      label: 'Last 30 Days',
      startDate: toBackendDateStr(past30),
      endDate: todayStr,
      displayLabel: `${formatDateIST(past30)} to ${formatDateIST(now)}`,
    };
  } else if (preset === 'historical') {
    return {
      id: 'historical',
      label: 'Historical Period (2020-2026)',
      startDate: '2020-01-01',
      endDate: todayStr,
      displayLabel: `01-01-2020 to ${formatDateIST(now)} (Historical Multi-Year Baseline)`,
    };
  }

  return {
    id: 'custom',
    label: 'Custom Range',
    startDate: todayStr,
    endDate: todayStr,
    displayLabel: `Custom: ${formatDateIST(now)}`,
  };
};

/**
 * Distance, duration, and metric formatters
 */
export const formatDistance = (km) => {
  if (km === undefined || km === null) return '0.0 km';
  return `${Number(km).toFixed(1)} km`;
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hrs}h ${mins}m`;
};

export const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const formatNumber = (val, decimals = 1) => {
  if (val === undefined || val === null || isNaN(val)) return '0.0';
  return Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
