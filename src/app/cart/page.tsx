"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { cart, loading, loadingItems, initialized, loadCart, updateQuantity, removeItem } = useCartStore();
  const router = useRouter();
  const { data: session } = useSession();

  // Load cart on mount
  useEffect(() => {
    if (!initialized) {
      loadCart();
    }
  }, [initialized, loadCart]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (!session) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    router.push("/checkout");
  };

  // Show loading state
  if (loading || !initialized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Show empty cart state
  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border rounded-lg p-4 shadow-sm"
              >
                {/* Product Image */}
                <div className="relative h-24 w-24 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.name}</h3>
                  <p className="text-gray-600">{formatPrice(item.price)}</p>
                  {item.stock !== undefined && item.stock <= 5 && (
                    <p className="text-sm text-red-500">
                      Only {item.stock} left in stock
                    </p>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1 || loadingItems.has(item.productId)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-12 text-center">
                      {loadingItems.has(item.productId) ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        <span className="text-sm">{item.quantity}</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      disabled={loadingItems.has(item.productId) || (item.stock !== undefined && item.quantity >= item.stock)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => removeItem(item.productId)}
                    disabled={loadingItems.has(item.productId)}
                  >
                    {loadingItems.has(item.productId) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Subtotal - Mobile Only */}
                <div className="w-full sm:hidden">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4 sticky top-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full"
              size="lg"
              disabled={loadingItems.size > 0}
            >
              {session ? "Proceed to Checkout" : "Login to Checkout"}
            </Button>
            {!session && (
              <p className="text-sm text-gray-600 text-center">
                You'll need to login to complete your purchase.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 