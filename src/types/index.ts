export enum UserRole {
  VENDOR = 'vendor',
  CENTER = 'center',
  ADMIN = 'admin'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  INITIATED = 'initiated',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum ProductStatus {
  AVAILABLE = 'available',
  DRAFT = 'draft',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued'
}

export enum VendorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status?: VendorStatus;
}

export interface Vendor extends User {
  role: UserRole.VENDOR;
  businessName: string;
  panNumber: string;
  bankDetails: {
    accountNumber: string;
    ifscCode?: string;
    bankName: string;
    branch?: string;
    holderName: string;
  };
  address: string;
  district: string;
  gstNumber?: string;
  status: VendorStatus;
  joinedDate: string;
  contactPersons?: Array<{
    name: string;
    phone: string;
    isPrimary?: boolean;
  }>;
  documents?: Array<{
    filename: string;
    originalName: string;
    path: string;
    uploadDate: string;
  }>;
}

export interface Center extends User {
  role: UserRole.CENTER;
  centerName: string;
  location: string;
  contactPerson: string;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: ProductStatus;
  images: string[];
  createdDate: string;
  updatedDate: string;
}

export interface Order {
  id: string;
  centerId: string;
  vendorId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryDate: string;
  createdDate: string;
  updatedDate: string;
  notes?: string;
  vendor?: Vendor;
  center?: Center;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: 'card' | 'bank_transfer' | 'upi' | 'wallet';
  transactionId?: string;
  createdDate: string;
  paidDate?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdDate: string;
}