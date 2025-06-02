"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type Cart = {
  items: CartItem[];
  total: number;
};

export function useShoppingCart() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  // Load cart data
  useEffect(() => {
    const loadCart = async () => {
      if (!session?.user) {
        setCart({ items: [], total: 0 });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/cart");
        
        if (response.ok) {
          const items = await response.json();
          const total = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
          setCart({ items, total });
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch cart:", errorText);
          toast.error("Failed to load your cart. Please try again.");
        }
      } catch (error) {
        console.error("Cart fetch error:", error);
        toast.error("Failed to load your cart. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [session]);

  // Add item to cart
  const addItem = async (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    if (!session?.user) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.productId,
          quantity: item.quantity || 1,
        }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart({
          items: updatedCart.items,
          total: updatedCart.items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)
        });
        toast.success(`${item.name} added to cart`);
      } else {
        const errorText = await response.text();
        console.error("Failed to add to cart:", errorText);
        toast.error("Failed to add item to cart. Please try again.");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add item to cart. Please check your connection.");
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    if (!session?.user) return;
    if (quantity < 1) return;

    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        const { items } = await response.json();
        const total = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
        setCart({ items, total });
    } else {
        const errorText = await response.text();
        console.error("Failed to update quantity:", errorText);
        toast.error("Failed to update quantity. Please try again.");
    }
    } catch (error) {
      console.error("Update quantity error:", error);
      toast.error("Failed to update quantity. Please check your connection.");
    }
  };

  // Remove item from cart
  const removeItem = async (productId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const newItems = cart.items.filter(item => item.productId !== productId);
        const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setCart({ items: newItems, total });
      toast.success("Item removed from cart");
      } else {
        const errorText = await response.text();
        console.error("Failed to remove item:", errorText);
        toast.error("Failed to remove item. Please try again.");
      }
    } catch (error) {
      console.error("Remove item error:", error);
      toast.error("Failed to remove item. Please check your connection.");
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
        setCart({ items: [], total: 0 });
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

  return {
    cart,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
} 