/**
 * Utility file containing sorting algorithms for the VRS system
 */

/**
 * Bubble Sort Algorithm Implementation
 * 
 * @param {Array} array - The array to be sorted
 * @param {string} key - Optional key for sorting objects
 * @param {boolean} ascending - Sort in ascending (true) or descending (false) order
 * @returns {Array} - The sorted array
 */
const bubbleSort = (array, key = null, ascending = true) => {
  // Create a copy of the array to avoid modifying the original
  const result = [...array];
  const n = result.length;
  
  // Comparison function based on whether we're sorting objects by key or simple values
  const compare = (a, b) => {
    const valueA = key ? a[key] : a;
    const valueB = key ? b[key] : b;
    
    // Handle different data types
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    } else {
      return ascending ? valueA - valueB : valueB - valueA;
    }
  };
  
  // Bubble sort algorithm implementation
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    
    for (let j = 0; j < n - i - 1; j++) {
      if (compare(result[j], result[j + 1]) > 0) {
        // Swap elements
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }
    
    // If no swapping occurred in this pass, array is sorted
    if (!swapped) break;
  }
  
  return result;
};

/**
 * Sort an array of objects by a specific field
 * 
 * @param {Array} array - Array of objects to sort
 * @param {string} field - The field to sort by
 * @param {boolean} ascending - Sort in ascending (true) or descending (false) order
 * @returns {Array} - The sorted array
 */
const sortByField = (array, field, ascending = true) => {
  return bubbleSort(array, field, ascending);
};

module.exports = {
  bubbleSort,
  sortByField
};