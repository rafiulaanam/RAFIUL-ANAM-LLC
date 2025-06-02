"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, X, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/utils";
import { Toaster } from "sonner";

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
    await updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId: string) => {
    // Prevent multiple clicks
    if (loadingItems.has(productId)) return;
    await removeItem(productId);
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
      <div className="min-h-[80vh] flex items-center justify-center">
        <Toaster position="top-center" />
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Show empty cart state
  if (!cart?.items?.length) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Toaster position="top-center" />
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added anything to your cart yet.
            Browse our products and find something you like!
          </p>
          <Link href="/products">
            <Button size="lg" className="min-w-[200px]">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 min-h-[80vh]">
      <Toaster position="top-center" />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <Link href="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.productId}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Product Image */}
                <Link 
                  href={`/products/${item.productId}`}
                  className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 96px) 100vw, 96px"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/products/${item.productId}`}
                    className="text-lg font-medium hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-muted-foreground mt-1">{formatPrice(item.price)}</p>
                  {item.stock !== undefined && item.stock <= 5 && (
                    <p className="text-sm text-red-500 mt-1">
                      Only {item.stock} left in stock
                    </p>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      disabled={loadingItems.has(item.productId)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-12 text-center">
                      {loadingItems.has(item.productId) ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        <span className="text-sm font-medium">{item.quantity}</span>
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

                  <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
                    <div className="sm:hidden flex-1">
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={loadingItems.has(item.productId)}
                    >
                      {loadingItems.has(item.productId) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Desktop Subtotal */}
                <div className="hidden sm:block text-right min-w-[100px]">
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 space-y-4 sticky top-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between text-base">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tax included and shipping calculated at checkout
                </p>
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
              <p className="text-sm text-muted-foreground text-center">
                You'll need to login to complete your purchase
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 