"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { Copy, Edit, Trash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductListProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onDuplicate: (productId: string) => void;
  isDeleting?: boolean;
  isDuplicating?: boolean;
}

export function ProductList({
  product,
  onEdit,
  onDelete,
  onDuplicate,
  isDeleting,
  isDuplicating
}: ProductListProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
      {/* Product Image and Basic Info */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative h-16 w-16 rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{product.name}</h3>
            <span className={cn(
              "text-sm px-2 py-0.5 rounded-full",
              product.isActive 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            )}>
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {product.description}
          </p>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex items-center gap-8 mx-4">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Price</p>
          <p className="font-semibold">{formatPrice(product.price)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Stock</p>
          <p className={cn(
            "font-medium",
            product.inventory.quantity <= product.inventory.lowStockThreshold
              ? "text-red-600"
              : "text-green-600"
          )}>
            {product.inventory.quantity}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Category</p>
          <p className="font-medium">
            {product.category?.name || "No Category"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDuplicate(product._id)}
          disabled={isDuplicating}
        >
          {isDuplicating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(product._id)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
} 