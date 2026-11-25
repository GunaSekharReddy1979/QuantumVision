/**
 * Risk utility helpers and category styling tokens.
 */
export const getRiskBadgeClass = (category) => {
  switch ((category || '').toLowerCase()) {
    case 'critical':
    case 'severe':
      return 'badge-danger';
    case 'high':
      return 'badge-danger';
    case 'moderate':
      return 'badge-simulated';
    case 'low':
    default:
      return 'badge-live';
  }
};

export const getRiskColor = (score) => {
  if (score >= 0.75) return '#ff003c';
  if (score >= 0.5) return '#ffaa00';
  if (score >= 0.25) return '#00f0ff';
  return '#00ff66';
};