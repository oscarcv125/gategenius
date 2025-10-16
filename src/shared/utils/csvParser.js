/**
 * Shared CSV Parser Utility
 * Used by all feature modules to load CSV data
 */

import Papa from 'papaparse';

/**
 * Parse CSV file from URL
 * @param {string} url - URL to CSV file
 * @returns {Promise<Array>} Parsed data as array of objects
 */
export const parseCSV = async (url) => {
  try {
    const response = await fetch(url);
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          console.log(`✅ Parsed CSV from ${url}:`, results.data.length, 'records');
          resolve(results.data);
        },
        error: (error) => {
          console.error(`❌ Error parsing CSV from ${url}:`, error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error(`❌ Error loading CSV from ${url}:`, error);
    throw error;
  }
};

/**
 * Validate CSV data has required fields
 * @param {Array} data - Parsed CSV data
 * @param {Array<string>} requiredFields - Required field names
 * @returns {Object} Validation result
 */
export const validateCSVData = (data, requiredFields) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      isValid: false,
      errors: ['CSV data is empty or invalid']
    };
  }

  const firstRow = data[0];
  const missingFields = requiredFields.filter(field => !(field in firstRow));

  if (missingFields.length > 0) {
    return {
      isValid: false,
      errors: [`Missing required fields: ${missingFields.join(', ')}`]
    };
  }

  return {
    isValid: true,
    errors: []
  };
};
