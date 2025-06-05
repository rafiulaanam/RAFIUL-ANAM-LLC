"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity?: number;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
  brand: string;
  rating: number;
  reviews: number;
}

interface ShopContextType {
  // Search and filtering
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  
  // Wishlist functionality
  wishlist: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Cart functionality (delegated to Zustand store)
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  isInCart: (productId: string) => boolean;
  getCartItemQuantity: (productId: string) => number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  // Cart state from Zustand
  const cartStore = useCartStore();

  // Initialize cart on mount
  useEffect(() => {
    if (!cartStore.initialized) {
      cartStore.loadCart();
    }
  }, [cartStore]);

  // Search and filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortOption, setSortOption] = useState("featured");

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Wishlist methods
  const addToWishlist = useCallback((productId: string) => {
    setWishlist(prev => [...new Set([...prev, productId])]);
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist(prev => prev.filter(id => id !== productId));
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  // Cart methods (delegated to Zustand store)
  const addToCart = useCallback(async (product: Product, quantity?: number) => {
    await cartStore.addItem(product, quantity);
  }, [cartStore]);

  const removeFromCart = useCallback(async (productId: string) => {
    await cartStore.removeItem(productId);
  }, [cartStore]);

  const updateCartQuantity = useCallback(async (productId: string, quantity: number) => {
    await cartStore.updateQuantity(productId, quantity);
  }, [cartStore]);

  const isInCart = useCallback((productId: string) => {
    return cartStore.cart?.items?.some(item => item.productId === productId) ?? false;
  }, [cartStore.cart?.items]);

  const getCartItemQuantity = useCallback((productId: string) => {
    return cartStore.cart?.items?.find(item => item.productId === productId)?.quantity ?? 0;
  }, [cartStore.cart?.items]);

  return (
    <ShopContext.Provider
      value={{
        // Search and filtering
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        priceRange,
        setPriceRange,
        sortOption,
        setSortOption,
        
        // Wishlist
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,

        // Cart (delegated to Zustand store)
        addToCart,
        removeFromCart,
        updateCartQuantity,
        isInCart,
        getCartItemQuantity,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
} 