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
  vendor: {
    _id: string;
    name: string;
  };
  brand: string;
  inventory: {
    quantity: number;
    lowStockThreshold: number;
  };
  status: "approved" | "pending" | "rejected" | "draft";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductFormData = Omit<Product, "_id" | "createdAt" | "updatedAt">; 