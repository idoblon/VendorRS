// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "vendor" | "user"; // or use the exported UserRole type if preferred
}

export interface BankDetails {
  bankName: string
  accountNumber: string
  holderName: string
  ifscCode?: string
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
  gstNumber: string
  status: VendorStatus
  joinedDate: string
  bankDetails?: BankDetails
}

export enum OrderStatus {  
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}