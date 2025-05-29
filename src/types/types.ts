import { Document, Types } from 'mongoose';

// Product Interfaces
export interface IInventory {
  quantity: number;
  lowStockThreshold: number;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  inventory: IInventory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isLowStock: boolean; // Virtual property
}

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ProductResponse = ApiResponse<IProduct>;
export type ProductsResponse = ApiResponse<IProduct[]>;

// Form Data Types
export type ProductFormData = Omit<
  IProduct,
  '_id' | 'createdAt' | 'updatedAt' | 'isLowStock'
>;

// Query Types
export interface ProductQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Pagination Type
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
} 