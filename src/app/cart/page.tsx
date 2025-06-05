"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/utils";
import { Toaster } from "sonner";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";

export default function CartPage() {
  const { cart, loading, initialized, loadCart, updateQuantity, removeItem } = useCartStore();
  const router = useRouter();
  const { data: session } = useSession();
  const [localQuantities, setLocalQuantities] = useState<{ [key: string]: number }>({});
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Load cart on mount
  useEffect(() => {
    if (!initialized) {
      loadCart();
    }
  }, [initialized, loadCart]);

  useEffect(() => {
    // Update local quantities when cart changes
    if (cart?.items) {
      const newQuantities: { [key: string]: number } = {};
      cart.items.forEach(item => {
        newQuantities[item.productId] = item.quantity;
      });
      setLocalQuantities(newQuantities);
    }
  }, [cart?.items]);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingItems(prev => new Set(prev).add(productId));
      setLocalQuantities(prev => ({ ...prev, [productId]: newQuantity }));
    await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Revert local quantity on error
      if (cart?.items) {
        const item = cart.items.find(item => item.productId === productId);
        if (item) {
          setLocalQuantities(prev => ({ ...prev, [productId]: item.quantity }));
        }
      }
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(productId));
      
      // Find current quantity
      const currentItem = cart?.items?.find(item => item.productId === productId);
      if (!currentItem) return;

      if (currentItem.quantity > 1) {
        // If quantity > 1, reduce by 1
        const newQuantity = currentItem.quantity - 1;
        setLocalQuantities(prev => ({ ...prev, [productId]: newQuantity }));
        await updateQuantity(productId, newQuantity);
        toast.success("Item quantity reduced");
      } else {
        // If quantity is 1, remove the item
    await removeItem(productId);
        // Remove from local quantities
        setLocalQuantities(prev => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error("Failed to update cart");
      // Revert local state on error
      if (cart?.items) {
        const item = cart.items.find(item => item.productId === productId);
        if (item) {
          setLocalQuantities(prev => ({ ...prev, [productId]: item.quantity }));
        }
      }
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleCheckout = () => {
    if (!session) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    router.push("/checkout");
  };

  // Calculate subtotal for an item
  const getItemSubtotal = (price: number, productId: string) => {
    const quantity = localQuantities[productId] || 1;
    return price * quantity;
  };

  // Calculate cart totals
  const calculateTotals = () => {
    if (!cart?.items) return { subtotal: 0, shipping: 0, total: 0 };
    
    const subtotal = cart.items.reduce((sum, item) => {
      const quantity = localQuantities[item.productId] || item.quantity;
      return sum + (item.price * quantity);
    }, 0);
    
    const shipping = 0; // You can calculate shipping based on your logic
    const total = subtotal + shipping;
    
    return { subtotal, shipping, total };
  };

  // Only show loading state on initial load
  if (!initialized && loading) {
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
  if (initialized && (!cart?.items || cart.items.length === 0)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Toaster position="top-center" />
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added anything to your cart yet.
            Browse our products and find something you like!
          </p>
          <Link href="/shop">
            <Button size="lg" className="min-w-[200px]">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { subtotal, shipping, total } = calculateTotals();

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 min-h-[80vh]">
      <Toaster position="top-center" />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <Link href="/shop">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 bg-card rounded-lg p-4 border relative"
            >
                {/* Product Image */}
              <div className="relative h-24 w-24 rounded-md overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
              </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                <h3 className="font-medium line-clamp-2">{item.name}</h3>
                <div className="mt-1 space-y-1">
                  <p className="text-lg font-bold">{formatPrice(item.price)}</p>
                  <p className="text-sm text-muted-foreground">
                    Subtotal: {formatPrice(getItemSubtotal(item.price, item.productId))}
                  </p>
                </div>
                  {item.stock !== undefined && item.stock <= 5 && (
                    <p className="text-sm text-red-500 mt-1">
                      Only {item.stock} left in stock
                    </p>
                  )}

                {/* Quantity Controls */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(item.productId, localQuantities[item.productId] - 1)}
                      disabled={updatingItems.has(item.productId) || localQuantities[item.productId] <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">
                      {localQuantities[item.productId] || item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(item.productId, localQuantities[item.productId] + 1)}
                      disabled={updatingItems.has(item.productId)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    × {formatPrice(item.price)} each
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => handleRemoveItem(item.productId)}
                disabled={updatingItems.has(item.productId)}
              >
                {updatingItems.has(item.productId) ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 border sticky top-20">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Including taxes and shipping
                </p>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full mt-6"
              size="lg"
              disabled={updatingItems.size > 0}
            >
              {session ? "Proceed to Checkout" : "Login to Checkout"}
            </Button>

            {!session && (
              <p className="text-sm text-muted-foreground text-center">
                You&apos;ll need to login to complete your purchase
              </p>
            )}

            <Link href="/shop" className="block mt-4">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>

            <div className="text-sm text-muted-foreground">
              You won&apos;t be charged until confirming your order at checkout.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 