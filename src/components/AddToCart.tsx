"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { Check, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";

interface AddToCartProps {
  product: {
    productId: string;
    name: string;
    price: number;
    image: string;
    stock?: number;
  };
  className?: string;
}

export function AddToCart({ product, className = "" }: AddToCartProps) {
  const { cart, initialized, loadCart, addItem, updateQuantity } = useCartStore();
  const [loading, setLoading] = useState(false);

  // Load cart on mount if not initialized
  useEffect(() => {
    if (!initialized) {
      loadCart();
    }
  }, [initialized, loadCart]);

  // Find if product is in cart
  const cartItem = cart.items.find(item => item.productId === product.productId);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addItem(product);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    setLoading(true);
    try {
      await updateQuantity(product.productId, newQuantity);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Please wait
      </Button>
    );
  }

  if (cartItem) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center rounded-md border">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
            disabled={cartItem.quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="w-12 text-center">
            <span className="text-sm">{cartItem.quantity}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
            disabled={product.stock !== undefined && cartItem.quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Check className="h-4 w-4 mr-1" />
          Added to cart
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      className={className}
      disabled={product.stock === 0}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
    </Button>
  );
} 