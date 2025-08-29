// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "vendor" | "user"; // or use the exported UserRole type if preferred

  // Vendor-specific optional properties
  businessName?: string;
  phone?: string;
  address?: string;
  district?: string;
  panNumber?: string;
  createdAt?: string;
  status?: VendorStatus;
  bankDetails?: BankDetails;
  documents?: Document[];
}

export interface BankDetails {
  bankName: string
  accountNumber: string
  holderName: string
  ifscCode?: string
}

export interface Document {
  name: string;
  type: string;
  url?: string;
}

export enum VendorStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

export interface Vendor {
  id: string
  _id: string
  name: string
  businessName: string
  email: string
  phone: string
  address: string
  district: string
  panNumber: string
  status: VendorStatus
  joinedDate: string
  bankDetails?: BankDetails
  documents?: Document[];
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  UPI = 'UPI',
  BANK_TRANSFER = 'Bank Transfer',
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
  NET_BANKING = 'Net Banking',
  CASH_ON_DELIVERY = 'Cash on Delivery'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: {
    color?: string;
    size?: string;
    variant?: string;
  };
}

export interface OrderSummary {
  subtotal: number;
  tax: {
    rate: number;
    amount: number;
  };
  shipping: {
    method: string;
    cost: number;
  };
  discount?: {
    type?: string;
    value?: number;
    amount: number;
  };
  adminCommission?: {
    amount: number;
    percentage: number;
  };
  totalAmount: number;
}

export interface DeliveryDetails {
  expectedDate?: string;
  actualDate?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  instructions?: string;
  trackingNumber?: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAmount: number;
  paidDate?: string;
  dueDate?: string;
}

export interface StatusHistory {
  status: OrderStatus;
  timestamp: string;
  updatedBy?: string;
  notes?: string;
}

export interface Communication {
  from: string;
  to: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  centerId: string;
  vendorId: string;
  items: OrderItem[];
  orderSummary: OrderSummary;
  status: OrderStatus;
  statusHistory: StatusHistory[];
  deliveryDetails: DeliveryDetails;
  payment: PaymentInfo;
  priority: Priority;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  
  // Populated fields
  center?: {
    name: string;
    location: string;
    code: string;
    contactPerson?: string;
    address?: string;
  };
  vendor?: {
    name: string;
    businessName: string;
    email: string;
    phone?: string;
    address?: string;
  };
  itemsWithProducts?: Array<OrderItem & {
    product?: {
      name: string;
      category: string;
      images?: Array<{ url: string }>;
      specifications?: any;
    };
  }>;
}
