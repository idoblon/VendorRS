// Utility to update page title dynamically
export const updatePageTitle = (title: string) => {
  document.title = `${title} - Vendor Request System`;
};

export const setDefaultTitle = () => {
  document.title = 'Vendor Request System';
};

// Page titles for different sections
export const PAGE_TITLES = {
  LOGIN: 'Sign In',
  SIGNUP: 'Vendor Registration',
  SIGNUP_SUCCESS: 'Registration Success',
  VENDOR_DASHBOARD: 'Vendor Dashboard',
  CENTER_DASHBOARD: 'Distribution Center Dashboard',
  ADMIN_DASHBOARD: 'Admin Dashboard',
  VENDOR_ORDERS: 'My Orders',
  VENDOR_PRODUCTS: 'Product Catalog',
  VENDOR_PAYMENTS: 'Payments',
  VENDOR_MESSAGES: 'Messages',
  VENDOR_ANALYTICS: 'Analytics',
  CENTER_MARKETPLACE: 'Marketplace',
  CENTER_CART: 'Shopping Cart',
  CENTER_ORDERS: 'My Orders',
  ADMIN_VENDORS: 'Vendor Management',
  ADMIN_CENTERS: 'Distribution Centers',
  ADMIN_SYSTEM: 'System Health'
} as const;


export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
}