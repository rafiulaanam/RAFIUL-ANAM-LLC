"use client";

import { useState } from "react";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";

interface AddToCartButtonProps {
  productId: string;
  price: number;
  name: string;
  image: string;
}

export function AddToCartButton({
  productId,
  price,
  name,
  image,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const { addItem, cart, loading } = useShoppingCart();

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      await addItem({
        productId,
        quantity: 1,
        price,
        name,
        image,
      });
      setShowCart(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Button disabled className="w-full">
        Loading...
      </Button>
    );
  }

  return (
    <Sheet open={showCart} onOpenChange={setShowCart}>
      <SheetTrigger asChild>
        <Button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Adding..." : "Add to Cart"}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-4">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4">
              <div className="relative h-16 w-16">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} × ${item.price}
                </p>
              </div>
            </div>
          ))}
          <div className="border-t pt-4">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Link href="/cart">
              <Button className="w-full" variant="outline">
                View Cart
              </Button>
            </Link>
            <Link href="/checkout">
              <Button className="w-full">
                Checkout
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 