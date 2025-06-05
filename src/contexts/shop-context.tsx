"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/types";

interface ShopContextType {
  // Search and filtering
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedRating: number | null;
  setSelectedRating: (rating: number | null) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  status: string;
  setStatus: (status: string) => void;
  
  // Wishlist functionality
  wishlist: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;

  // Cart functionality (delegated to Zustand store)
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  isInCart: (productId: string) => boolean;
  getCartItemQuantity: (productId: string) => number;

  // Loading state
  state: {
    isLoading: boolean;
    error: string | null;
  };
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState("newest");
  const [status, setStatus] = useState("all");

  // Loading state
  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  // Save wishlist to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

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

  const toggleWishlist = useCallback((productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  // Cart methods (delegated to Zustand store)
  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await cartStore.addItem(product, quantity);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "Failed to add item to cart" 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [cartStore]);

  const removeFromCart = useCallback(async (productId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await cartStore.removeItem(productId);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "Failed to remove item from cart" 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [cartStore]);

  const updateCartQuantity = useCallback(async (productId: string, quantity: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await cartStore.updateQuantity(productId, quantity);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "Failed to update quantity" 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
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
        searchQuery,
        setSearchQuery,
        selectedCategories,
        setSelectedCategories,
        selectedBrands,
        setSelectedBrands,
        priceRange,
        setPriceRange,
        selectedRating,
        setSelectedRating,
        sortOption,
        setSortOption,
        status,
        setStatus,
        
        // Wishlist
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,

        // Cart (delegated to Zustand store)
        addToCart,
        removeFromCart,
        updateCartQuantity,
        isInCart,
        getCartItemQuantity,

        // Loading state
        state,
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