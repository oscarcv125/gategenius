/**
 * Date Helper Functions
 */

/**
 * Format days until expiry with human-readable text
 * @param {number} days - Days until expiry (can be negative)
 * @returns {string} Formatted string
 */
export function formatDaysUntilExpiry(days) {
  if (days === 0) {
    return 'Today';
  } else if (days < 0) {
    return `${Math.abs(days)} days ago`;
  } else {
    return `${days} days`;
  }
}

/**
 * Get color class based on days until expiry
 * @param {number} days - Days until expiry
 * @returns {string} Tailwind color class
 */
export function getExpiryColor(days) {
  if (days < 0) {
    return 'text-gray-500'; // Expired (already passed)
  } else if (days === 0) {
    return 'text-red-600 font-bold'; // Expires today
  } else if (days <= 3) {
    return 'text-orange-600 font-bold'; // Critical (3 days or less)
  } else if (days <= 7) {
    return 'text-yellow-600 font-medium'; // Warning (this week)
  } else {
    return 'text-gray-900'; // Normal
  }
}

/**
 * Check if a product is expired
 * @param {number} days - Days until expiry
 * @returns {boolean}
 */
export function isExpired(days) {
  return days < 0;
}
