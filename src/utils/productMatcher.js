/**
 * Product Matcher Utility
 *
 * Intelligent matching system that finds products in the database
 * based on partial or complete scan data (ID, LOT, name, expiry date)
 */

/**
 * Calculate string similarity (Levenshtein distance normalized)
 */
function stringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;

  str1 = str1.toLowerCase().trim();
  str2 = str2.toLowerCase().trim();

  if (str1 === str2) return 1;

  // Simple word matching for product names
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);

  let matchCount = 0;
  words1.forEach(word1 => {
    if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
      matchCount++;
    }
  });

  return matchCount / Math.max(words1.length, words2.length);
}

/**
 * Match scanned data against products database
 */
export function matchScannedProduct(scannedData, productsDatabase) {
  if (!productsDatabase || productsDatabase.length === 0) {
    return {
      matches: [],
      matchType: 'NO_DATABASE',
      confidence: 0
    };
  }

  const {
    Product_ID,
    LOT_Number,
    Expiry_Date,
    Product_Name
  } = scannedData;

  let matches = [];
  let matchType = 'NONE';
  let confidence = 0;

  // Priority 1: Exact Product ID match
  if (Product_ID && Product_ID !== 'Unknown') {
    const exactIdMatch = productsDatabase.filter(p =>
      p.Product_ID && p.Product_ID.toLowerCase() === Product_ID.toLowerCase()
    );

    if (exactIdMatch.length > 0) {
      matches = exactIdMatch;
      matchType = 'PRODUCT_ID';
      confidence = 0.95;
    }
  }

  // Priority 2: Exact LOT Number match
  if (matches.length === 0 && LOT_Number && LOT_Number !== 'Unknown') {
    const exactLotMatch = productsDatabase.filter(p =>
      p.LOT_Number && p.LOT_Number.toLowerCase() === LOT_Number.toLowerCase()
    );

    if (exactLotMatch.length > 0) {
      matches = exactLotMatch;
      matchType = 'LOT_NUMBER';
      confidence = 0.95;
    }
  }

  // Priority 3: Product Name + Expiry Date combination
  if (matches.length === 0 && Product_Name && Product_Name !== 'Unknown' &&
      Expiry_Date && Expiry_Date !== 'Unknown') {
    const nameExpiryMatch = productsDatabase.filter(p => {
      const nameSim = stringSimilarity(Product_Name, p.Product_Name);
      const dateMatch = p.Expiry_Date === Expiry_Date;
      return nameSim > 0.6 && dateMatch;
    });

    if (nameExpiryMatch.length > 0) {
      matches = nameExpiryMatch;
      matchType = 'NAME_AND_DATE';
      confidence = 0.85;
    }
  }

  // Priority 4: Fuzzy Product Name match
  if (matches.length === 0 && Product_Name && Product_Name !== 'Unknown') {
    const fuzzyMatches = productsDatabase
      .map(p => ({
        product: p,
        similarity: stringSimilarity(Product_Name, p.Product_Name)
      }))
      .filter(m => m.similarity > 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Top 5 matches

    if (fuzzyMatches.length > 0) {
      matches = fuzzyMatches.map(m => m.product);
      matchType = 'FUZZY_NAME';
      confidence = fuzzyMatches[0].similarity;
    }
  }

  // Priority 5: Expiry Date only
  if (matches.length === 0 && Expiry_Date && Expiry_Date !== 'Unknown') {
    const dateMatches = productsDatabase.filter(p =>
      p.Expiry_Date === Expiry_Date
    );

    if (dateMatches.length > 0) {
      matches = dateMatches.slice(0, 10); // Limit to 10
      matchType = 'EXPIRY_DATE';
      confidence = 0.6;
    }
  }

  return {
    matches,
    matchType,
    confidence,
    scannedData
  };
}

/**
 * Format match results for display
 */
export function formatMatchResult(matchResult) {
  const { matches, matchType, confidence, scannedData } = matchResult;

  if (matches.length === 0) {
    return {
      status: 'NOT_IN_DATABASE',
      title: '⚠️ Not in Drawer Database',
      description: `Scanned product "${scannedData.Product_Name || 'Unknown'}" was not found in the inventory system.`,
      suggestion: 'This may not be a drawer product. Contact inventory manager.',
      color: 'red'
    };
  }

  let title = '';
  let description = '';

  switch (matchType) {
    case 'PRODUCT_ID':
      title = '✅ Exact Product ID Match';
      description = `Found by Product ID: ${scannedData.Product_ID}`;
      break;
    case 'LOT_NUMBER':
      title = '✅ Exact LOT Number Match';
      description = `Found by LOT: ${scannedData.LOT_Number}`;
      break;
    case 'NAME_AND_DATE':
      title = '✅ Product and Date Match';
      description = `Matched "${scannedData.Product_Name}" expiring ${scannedData.Expiry_Date}`;
      break;
    case 'FUZZY_NAME':
      title = `📊 ${matches.length} Similar Product${matches.length > 1 ? 's' : ''} Found`;
      description = `Best match for "${scannedData.Product_Name}"`;
      break;
    case 'EXPIRY_DATE':
      title = `📅 ${matches.length} Product${matches.length > 1 ? 's' : ''} Expiring This Date`;
      description = `All products expiring ${scannedData.Expiry_Date}`;
      break;
    default:
      title = '✅ Match Found';
      description = 'Product located in database';
  }

  return {
    status: 'FOUND',
    title,
    description,
    matches,
    matchType,
    confidence: Math.round(confidence * 100),
    color: confidence > 0.8 ? 'green' : 'yellow'
  };
}
