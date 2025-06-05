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
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  brand: string;
  rating: number;
  reviewCount: number;
  categoryId: string;
  vendorId: string;
  vendor?: {
    _id: string;
    name: string;
  };
  category?: {
    _id: string;
    name: string;
  };
  isNew: boolean;
  isBestSeller: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  status: "pending" | "active" | "inactive";
  stock?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: "active" | "inactive";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface FilterState {
  search: string;
  category: string[];
  minPrice: number;
  maxPrice: number;
  brand: string[];
  sort: string;
  page: number;
  size: number;
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

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  stock?: number;
  comparePrice?: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
}

export interface Review {
  _id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
    image?: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
} 