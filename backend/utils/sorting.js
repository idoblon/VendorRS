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
  
  // Use JavaScript's built-in sort method which is more efficient than bubble sort
  return result.sort(compare);
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