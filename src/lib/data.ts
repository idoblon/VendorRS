export interface Category {
  _id: string
  name: string
}

export interface Center {
  _id: string
  name: string
  categoryId: string
}

export interface Order {
  _id: string
  orderNumber: string
  centerId: string
  vendorId: string
  items: {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
    specifications?: {
      color?: string
      size?: string
      variant?: string
    }
  }[]
  orderSummary: {
    subtotal: number
    tax: {
      rate: number
      amount: number
    }
    shipping: {
      method?: string
      cost: number
    }
    discount: {
      type?: string
      value?: number
      amount: number
    }
    totalAmount: number
  }
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED"
  statusHistory: {
    status: string
    timestamp: string
    updatedBy?: string
    notes?: string
  }[]
  deliveryDetails?: {
    expectedDate?: string
    actualDate?: string
    address?: {
      street?: string
      city?: string
      state?: string
      pincode?: string
      country?: string
    }
    instructions?: string
    trackingNumber?: string
  }
  payment: {
    method: string
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED"
    transactionId?: string
    paidAmount: number
    paidDate?: string
    dueDate?: string
  }
  communication?: {
    from: string
    to: string
    message: string
    timestamp: string
    isRead: boolean
  }[]
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  tags?: string[]
  notes?: string
  attachments?: {
    filename: string
    originalName: string
    path: string
    uploadDate: string
    uploadedBy?: string
  }[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  __v: number
}
