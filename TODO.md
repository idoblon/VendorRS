# Fix CenterDashboard Product Addition Issue

## Problem Analysis
The CenterDashboard currently uses mock data and does not integrate with backend APIs for product management. When users add products, they see "added successfully" but the product doesn't appear in inventory because:
1. `handleAddProduct` only logs to console and doesn't call backend API
2. Inventory display uses static `mockProducts` array instead of real data
3. Missing `createProduct` function in productApi.ts
4. Backend permissions may need adjustment for center role

## Implementation Plan

### Step 1: Add createProduct function to productApi.ts
- Create a `createProduct` function that calls POST /api/products
- Handle proper error handling and response parsing

### Step 2: Add getProductsByCenter function to productApi.ts
- Implement function to fetch products for the current center
- Use the existing `/api/products/center/:centerId` endpoint

### Step 3: Update CenterDashboard to use real API data
- Replace `mockProducts` with state that fetches from backend
- Update `handleAddProduct` to call `createProduct` API
- Add loading states and error handling

### Step 4: Check backend permissions (if needed)
- Verify if center role has permission to create products
- Adjust backend routes if necessary

### Step 5: Test the implementation
- Verify product creation works end-to-end
- Test inventory display updates after adding products

## Files to Modify
1. `src/utils/productApi.ts` - Add createProduct and getProductsByCenter functions
2. `src/components/dashboards/CenterDashboard.tsx` - Update to use real API data
3. `backend/routes/products.js` - (If needed) Adjust permissions for center role

## Current Status
- [x] Step 1: Add createProduct function
- [x] Step 2: Add getProductsByCenter function  
- [x] Step 3: Update CenterDashboard (imports added, need to fix TypeScript errors)
- [ ] Step 4: Check backend permissions
- [ ] Step 5: Test implementation
