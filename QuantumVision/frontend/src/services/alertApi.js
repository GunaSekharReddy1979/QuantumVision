/**
 * QuantumVision Flood Alerts & Early Warning API Service.
 */
import { request } from './apiClient';

/**
 * Fetches all flood alerts matching optional filters.
 */
export async function fetchAlerts(params = {}) {
  const query = new URLSearchParams();
  if (params.location_id && params.location_id !== 'all') {
    query.append('location_id', params.location_id);
  }
  if (params.severity && params.severity !== 'all') {
    query.append('severity', params.severity);
  }
  if (params.category && params.category !== 'all') {
    query.append('category', params.category);
  }
  if (params.status && params.status !== 'all') {
    query.append('status', params.status);
  }
  if (params.classification && params.classification !== 'all') {
    query.append('classification', params.classification);
  }
  if (params.search) {
    query.append('search', params.search);
  }
  if (params.sort_by) {
    query.append('sort_by', params.sort_by);
  }
  if (typeof params.include_simulated === 'boolean') {
    query.append('include_simulated', String(params.include_simulated));
  }

  const endpoint = `/alerts${query.toString() ? `?${query.toString()}` : ''}`;
  return request(endpoint);
}

/**
 * Fetches real-time alert summary metrics.
 */
export async function fetchAlertSummary(locationId = null) {
  const query = locationId && locationId !== 'all' ? `?location_id=${locationId}` : '';
  return request(`/alerts/summary${query}`);
}

/**
 * Fetches recent unacknowledged alerts for the top navbar bell.
 */
export async function fetchAlertNotifications(limit = 5) {
  return request(`/alerts/notifications?limit=${limit}`);
}

/**
 * Fetches complete dossier for a single alert.
 */
export async function fetchAlertById(alertId) {
  return request(`/alerts/${alertId}`);
}

/**
 * Acknowledges an active alert.
 */
export async function acknowledgeAlert(alertId, acknowledgedBy = 'EOC Duty Officer') {
  return request(`/alerts/${alertId}/acknowledge`, {
    method: 'POST',
    body: JSON.stringify({ acknowledged_by: acknowledgedBy }),
  });
}

/**
 * Resolves an active alert when hazard subsides.
 */
export async function resolveAlert(alertId, resolvedBy = 'EOC Commander', resolutionNote = '') {
  return request(`/alerts/${alertId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({
      resolved_by: resolvedBy,
      resolution_note: resolutionNote,
    }),
  });
}

/**
 * Triggers re-evaluation of live telemetry and models.
 */
export async function refreshAlerts(locationId = null) {
  const query = locationId && locationId !== 'all' ? `?location_id=${locationId}` : '';
  return request(`/alerts/refresh${query}`, { method: 'POST', body: JSON.stringify({}) });
}

// Named aliases for component imports
export const fetchNotifications = fetchAlertNotifications;
export const acknowledgeAlertApi = acknowledgeAlert;
export const resolveAlertApi = resolveAlert;
export const refreshAlertsApi = refreshAlerts;


