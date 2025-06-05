import { create } from 'zustand';
import { toast } from 'sonner';
import { Product } from '@/types';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  stock?: number;
  comparePrice?: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
}

interface CartStore {
  cart: CartState;
  loading: boolean;
  loadingItems: Set<string>;
  initialized: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  loadCart: () => Promise<void>;
  clearCart: () => Promise<void>;
}

const calculateCartTotals = (items: CartItem[]): CartState => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  
  return {
    items,
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping
  };
};

const syncWithLocalStorage = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
};

const loadFromLocalStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  }
  return [];
};

const initialCartState: CartState = {
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0
};

export const useCartStore = create<CartStore>((set, get) => ({
  cart: initialCartState,
  loading: false,
  loadingItems: new Set<string>(),
  initialized: false,

  loadCart: async () => {
    // Prevent multiple simultaneous calls and reloading if already initialized
    if (get().loading || get().initialized) {
      return;
    }

    try {
      set({ loading: true });
      
      // Try to fetch from API first (for logged-in users)
      const response = await fetch('/api/cart');
      
      const data = await response.json();
      
      if (response.ok) {
        const items = data.items || [];
        set({ 
          cart: calculateCartTotals(items),
          initialized: true,
          loading: false 
        });
      } else {
        // If API fails (guest user), load from localStorage
        const items = loadFromLocalStorage();
        set({ 
          cart: calculateCartTotals(items),
          initialized: true,
          loading: false 
        });
        
        // Show error message if it's not just an unauthorized error
        if (response.status !== 401) {
          toast.error(data.error || "Failed to load your cart");
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Fallback to localStorage on error
      const items = loadFromLocalStorage();
      set({ 
        cart: calculateCartTotals(items),
        initialized: true,
        loading: false 
      });
      toast.error("Failed to load your cart. Please try again.");
    }
  },

  addItem: async (product, quantity = 1) => {
    try {
      const currentItems = get().cart.items;
      const existingItem = currentItems.find(item => item.productId === product._id);

      // Set loading state for this item
      set(state => ({
        loadingItems: new Set(state.loadingItems).add(product._id)
      }));

      // Prepare cart item from product
      const cartItem: CartItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        images: product.images,
        stock: product.stock,
        comparePrice: product.comparePrice
      };

      // Try API first
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartItem)
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        set(state => ({ 
          cart: calculateCartTotals(items),
          loadingItems: new Set([...state.loadingItems].filter(id => id !== product._id))
        }));
        toast.success(existingItem ? 'Cart updated' : 'Added to cart');
      } else {
        // Fallback to localStorage
        let updatedItems;
        if (existingItem) {
          updatedItems = currentItems.map(item =>
            item.productId === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedItems = [...currentItems, cartItem];
        }
        
        set(state => ({ 
          cart: calculateCartTotals(updatedItems),
          loadingItems: new Set([...state.loadingItems].filter(id => id !== product._id))
        }));
        syncWithLocalStorage(updatedItems);
        toast.success(existingItem ? 'Cart updated' : 'Added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      set(state => ({
        loadingItems: new Set([...state.loadingItems].filter(id => id !== product._id))
      }));
      toast.error('Failed to update cart');
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    try {
      // If quantity is 0 or less, remove the item
      if (quantity <= 0) {
        await get().removeItem(productId);
        return;
      }

      // Set loading state for this item
      set(state => ({
        loadingItems: new Set(state.loadingItems).add(productId)
      }));

      // Try API first
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        set(state => ({ 
          cart: calculateCartTotals(items),
          loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
        }));
        toast.success('Cart updated');
      } else {
        // Fallback to localStorage
        const currentItems = get().cart.items;
        const updatedItems = currentItems.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        );
        
        set(state => ({ 
          cart: calculateCartTotals(updatedItems),
          loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
        }));
        syncWithLocalStorage(updatedItems);
        toast.success('Cart updated');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      set(state => ({
        loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
      }));
      toast.error('Failed to update cart');
    }
  },

  removeItem: async (productId: string) => {
    try {
      // Set loading state for this item
      set(state => ({
        loadingItems: new Set(state.loadingItems).add(productId)
      }));

      // Try API first
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        set(state => ({ 
          cart: calculateCartTotals(items),
          loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
        }));
        toast.success('Item removed from cart');
      } else {
        // Fallback to localStorage
        const currentItems = get().cart.items;
        const updatedItems = currentItems.filter(item => item.productId !== productId);
        
        set(state => ({ 
          cart: calculateCartTotals(updatedItems),
          loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
        }));
        syncWithLocalStorage(updatedItems);
        toast.success('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      set(state => ({
        loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
      }));
      toast.error('Failed to remove item');
    }
  },

  clearCart: async () => {
    try {
      set({ loading: true });

      // Try API first
      const response = await fetch('/api/cart', {
        method: 'DELETE'
      });

      if (response.ok) {
        set({ 
          cart: initialCartState,
          loading: false 
        });
        localStorage.removeItem('cart');
        toast.success('Cart cleared');
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      set({ loading: false });
      toast.error('Failed to clear cart');
    }
  }
})); 