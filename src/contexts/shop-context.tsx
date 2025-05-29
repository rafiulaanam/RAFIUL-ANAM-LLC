"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useSession } from "next-auth/react";

// Define types
export type Product = {
  id: string;
  name: string;
  price: number;
  // Add other product properties as needed
};

type ShopState = {
  cart: Product[];
  wishlist: Product[];
  isLoading: boolean;
  error: string | null;
};

type ShopAction =
  | { type: "ADD_TO_CART"; payload: Product }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "ADD_TO_WISHLIST"; payload: Product }
  | { type: "REMOVE_FROM_WISHLIST"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_CART" }
  | { type: "CLEAR_WISHLIST" }
  | { type: "LOAD_CART"; payload: Product[] }
  | { type: "LOAD_WISHLIST"; payload: Product[] };

type ShopContextType = {
  state: ShopState;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearCart: () => void;
  clearWishlist: () => void;
};

// Create context
const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Initial state
const initialState: ShopState = {
  cart: [],
  wishlist: [],
  isLoading: false,
  error: null,
};

// Reducer
function shopReducer(state: ShopState, action: ShopAction): ShopState {
  switch (action.type) {
    case "ADD_TO_CART":
      return {
        ...state,
        cart: [...state.cart, action.payload],
      };
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };
    case "ADD_TO_WISHLIST":
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload],
      };
    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        wishlist: state.wishlist.filter((item) => item.id !== action.payload),
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
      };
    case "CLEAR_WISHLIST":
      return {
        ...state,
        wishlist: [],
      };
    case "LOAD_CART":
      return {
        ...state,
        cart: action.payload,
      };
    case "LOAD_WISHLIST":
      return {
        ...state,
        wishlist: action.payload,
      };
    default:
      return state;
  }
}

// Provider component
export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(shopReducer, initialState);
  const { data: session } = useSession();

  // Load cart and wishlist data when session changes
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user) {
        try {
          dispatch({ type: "SET_LOADING", payload: true });
          
          // Load cart data from API
          const cartResponse = await fetch("/api/cart");
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            dispatch({ type: "LOAD_CART", payload: cartData });
          }

          // Load wishlist data from API
          const wishlistResponse = await fetch("/api/wishlist");
          if (wishlistResponse.ok) {
            const wishlistData = await wishlistResponse.json();
            dispatch({ type: "LOAD_WISHLIST", payload: wishlistData });
          }
        } catch (error) {
          dispatch({ 
            type: "SET_ERROR", 
            payload: "Failed to load shop data" 
          });
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } else {
        // Clear data when user logs out
        dispatch({ type: "CLEAR_CART" });
        dispatch({ type: "CLEAR_WISHLIST" });
      }
    };

    loadUserData();
  }, [session]);

  // Context value
  const value: ShopContextType = {
    state,
    addToCart: (product) => {
      dispatch({ type: "ADD_TO_CART", payload: product });
    },
    removeFromCart: (productId) => {
      dispatch({ type: "REMOVE_FROM_CART", payload: productId });
    },
    addToWishlist: (product) => {
      dispatch({ type: "ADD_TO_WISHLIST", payload: product });
    },
    removeFromWishlist: (productId) => {
      dispatch({ type: "REMOVE_FROM_WISHLIST", payload: productId });
    },
    clearCart: () => {
      dispatch({ type: "CLEAR_CART" });
    },
    clearWishlist: () => {
      dispatch({ type: "CLEAR_WISHLIST" });
    },
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

// Hook for using the shop context
export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
} 