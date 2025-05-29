"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export function useShoppingCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  // Load cart data
  useEffect(() => {
    const loadCart = async () => {
      if (!session?.user) {
        setCart([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch("/api/cart");
        
        if (response.ok) {
          const data = await response.json();
          setCart(data);
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch cart:", errorText);
          toast.error("Failed to load your cart. Please try again.");
        }
      } catch (error) {
        console.error("Cart fetch error:", error);
        toast.error("Failed to load your cart. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [session]);

  // Save cart data
  const saveCart = async (newCart: CartItem[]) => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: newCart }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to save cart:", errorText);
        toast.error("Failed to update your cart. Please try again.");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Cart save error:", error);
      toast.error("Failed to update your cart. Please check your connection.");
      return false;
    }
  };

  // Add item to cart
  const addItem = async (item: CartItem) => {
    const existingItem = cart.find((i) => i.id === item.id);
    let newCart: CartItem[];

    if (existingItem) {
      newCart = cart.map((i) =>
        i.id === item.id
          ? { ...i, quantity: i.quantity + (item.quantity || 1) }
          : i
      );
    } else {
      newCart = [...cart, { ...item, quantity: item.quantity || 1 }];
    }

    const success = await saveCart(newCart);
    if (success) {
      setCart(newCart);
      toast.success(`${item.name} added to cart`);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    const newCart = cart.filter((item) => item.id !== itemId);
    const success = await saveCart(newCart);
    if (success) {
      setCart(newCart);
      toast.success("Item removed from cart");
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    const newCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );

    const success = await saveCart(newCart);
    if (success) {
      setCart(newCart);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
      });

      if (response.ok) {
        setCart([]);
        toast.success("Cart cleared");
      } else {
        const errorText = await response.text();
        console.error("Failed to clear cart:", errorText);
        toast.error("Failed to clear your cart. Please try again.");
      }
    } catch (error) {
      console.error("Cart clear error:", error);
      toast.error("Failed to clear your cart. Please check your connection.");
    }
  };

  // Calculate totals
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartTotal,
    itemCount,
  };
} 