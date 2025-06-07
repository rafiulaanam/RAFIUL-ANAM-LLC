"use client";

import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash } from "lucide-react";
import Image from "next/image";

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!products?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No products found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product._id} className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image
                src={product.image || "/placeholder-product.png"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {product.description?.length > 100
                  ? `${product.description.slice(0, 100)}...`
                  : product.description}
              </p>
              <div className="mt-1 flex items-center space-x-2">
                <Badge variant="outline">${product.price?.toFixed(2) || "0.00"}</Badge>
                <Badge variant="outline">{product.category?.name || "Uncategorized"}</Badge>
                <div
                  className={`inline-flex h-2 w-2 rounded-full ${getStatusColor(
                    product.status
                  )}`}
                />
                <span className="text-sm capitalize">{product.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(product)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(product._id)}
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
} 