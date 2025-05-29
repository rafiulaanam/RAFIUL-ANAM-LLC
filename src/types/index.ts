export type UserRole = 'ADMIN' | 'VENDOR' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  userId: string; // Vendor ID
  logo?: string;
  banner?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  storeId: string;
  stock: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  shippingAddress: Address;
  paymentIntent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'; 