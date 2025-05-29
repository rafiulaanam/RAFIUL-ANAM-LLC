export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: {
    _id: string;
    name: string;
  };
  brand: string;
  inventory: {
    quantity: number;
    lowStockThreshold: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductFormData = Omit<Product, "_id" | "createdAt" | "updatedAt">; 