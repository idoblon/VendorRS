/**
 * Test script for sorting utilities
 */

const { bubbleSort, sortByField } = require('../utils/sorting');

// Test basic array sorting
console.log('\n--- Testing basic array sorting ---');
const numbers = [5, 3, 8, 1, 2, 7, 4, 6];
console.log('Original array:', numbers);
console.log('Sorted ascending:', bubbleSort(numbers));
console.log('Sorted descending:', bubbleSort(numbers, null, false));

// Test sorting strings
console.log('\n--- Testing string sorting ---');
const fruits = ['banana', 'apple', 'orange', 'mango', 'kiwi'];
console.log('Original array:', fruits);
console.log('Sorted ascending:', bubbleSort(fruits));
console.log('Sorted descending:', bubbleSort(fruits, null, false));

// Test sorting objects by field
console.log('\n--- Testing object sorting by field ---');
const products = [
  { id: 1, name: 'Laptop', price: 1200, stock: 15 },
  { id: 2, name: 'Phone', price: 800, stock: 25 },
  { id: 3, name: 'Tablet', price: 500, stock: 10 },
  { id: 4, name: 'Headphones', price: 150, stock: 30 },
  { id: 5, name: 'Monitor', price: 300, stock: 20 }
];

console.log('Original products:', JSON.stringify(products, null, 2));

// Sort by price (ascending)
console.log('\nSorted by price (ascending):');
const sortedByPriceAsc = sortByField(products, 'price', true);
console.log(JSON.stringify(sortedByPriceAsc, null, 2));

// Sort by price (descending)
console.log('\nSorted by price (descending):');
const sortedByPriceDesc = sortByField(products, 'price', false);
console.log(JSON.stringify(sortedByPriceDesc, null, 2));

// Sort by name (alphabetical)
console.log('\nSorted by name (alphabetical):');
const sortedByName = sortByField(products, 'name', true);
console.log(JSON.stringify(sortedByName, null, 2));

// Sort by stock (highest first)
console.log('\nSorted by stock (highest first):');
const sortedByStock = sortByField(products, 'stock', false);
console.log(JSON.stringify(sortedByStock, null, 2));

console.log('\n--- All sorting tests completed ---');