/**
 * Productivity Calculations
 * Pure utility functions for productivity-related calculations
 */

/**
 * Estimate drawer assembly time based on complexity
 * @param {Object} drawer - Drawer with Total_Items and Unique_Item_Types
 * @returns {number} Estimated time in minutes
 */
export const estimateDrawerTime = (drawer) => {
  const totalItems = drawer.Total_Items || 0;
  const uniqueTypes = drawer.Unique_Item_Types || 0;

  // Base time: 30 seconds per item
  const baseTime = totalItems * 0.5;

  // Complexity multiplier based on unique types
  const complexityFactor = 1 + (uniqueTypes * 0.1);

  return Math.round(baseTime * complexityFactor * 10) / 10;
};

/**
 * Convert minutes to hours (rounded to 1 decimal)
 * @param {number} minutes - Minutes
 * @returns {number} Hours
 */
export const minutesToHours = (minutes) => {
  return Math.round((minutes / 60) * 10) / 10;
};

/**
 * Calculate workers needed for given hours and shift duration
 * @param {number} totalHours - Total work hours
 * @param {number} shiftHours - Shift duration in hours
 * @returns {number} Number of workers needed
 */
export const calculateWorkersNeeded = (totalHours, shiftHours = 8) => {
  return Math.ceil(totalHours / shiftHours);
};

/**
 * Calculate utilization percentage
 * @param {number} totalHours - Total work hours
 * @param {number} workersNeeded - Number of workers
 * @param {number} shiftHours - Shift duration
 * @returns {number} Utilization percentage
 */
export const calculateUtilization = (totalHours, workersNeeded, shiftHours) => {
  return Math.round((totalHours / (workersNeeded * shiftHours)) * 100);
};

/**
 * Get complexity category based on time
 * @param {number} timeMinutes - Time in minutes
 * @returns {string} Category: SIMPLE, MEDIUM, COMPLEX
 */
export const getComplexityCategory = (timeMinutes) => {
  if (timeMinutes < 5) return 'SIMPLE';
  if (timeMinutes <= 8) return 'MEDIUM';
  return 'COMPLEX';
};
