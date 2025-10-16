/**
 * Expiration Calculations
 * Pure utility functions for expiration-related calculations
 */

/**
 * Calculate days until expiry from expiry date string
 * @param {string} expiryDate - Expiry date in YYYY-MM-DD format
 * @returns {number} Days until expiry (negative if expired)
 */
export const calculateDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Format days until expiry as human-readable string
 * @param {number} days - Days until expiry
 * @returns {string} Formatted string
 */
export const formatDaysUntilExpiry = (days) => {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `Expired ${Math.abs(days)} days ago`;
  return `${days} days`;
};

/**
 * Get expiry category based on days until expiry
 * @param {number} days - Days until expiry
 * @returns {string} Category: EXPIRED, CRITICAL, WARNING, MODERATE, SAFE
 */
export const getExpiryCategory = (days) => {
  if (days < 0) return 'EXPIRED';
  if (days === 0) return 'CRITICAL';
  if (days <= 7) return 'WARNING';
  if (days <= 30) return 'MODERATE';
  return 'SAFE';
};

/**
 * Estimate product value based on unit cost
 * @param {number} quantity - Product quantity
 * @param {number} unitCost - Cost per unit (default: 1.5)
 * @returns {number} Estimated value
 */
export const estimateProductValue = (quantity, unitCost = 1.5) => {
  return quantity * unitCost;
};
