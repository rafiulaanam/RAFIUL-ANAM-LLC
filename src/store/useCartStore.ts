import { create } from 'zustand';
import { toast } from 'sonner';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock?: number;
}

interface CartStore {
  cart: {
    items: CartItem[];
    total: number;
  };
  loading: boolean;
  loadingItems: Set<string>;
  initialized: boolean;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  loadCart: () => Promise<void>;
  clearCart: () => Promise<void>;
}

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

export const useCartStore = create<CartStore>((set, get) => ({
  cart: {
    items: [],
    total: 0
  },
  loading: false,
  loadingItems: new Set<string>(),
  initialized: false,

  loadCart: async () => {
    try {
      set({ loading: true });
      
      // Try to fetch from API first (for logged-in users)
      const response = await fetch('/api/cart');
      
      const data = await response.json();
      
      if (response.ok) {
        const items = data.items || [];
        set({ 
          cart: {
            items,
            total: calculateTotal(items)
          },
          initialized: true,
          loading: false 
        });
      } else {
        // If API fails (guest user), load from localStorage
        const items = loadFromLocalStorage();
        set({ 
          cart: {
            items,
            total: calculateTotal(items)
          },
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
        cart: {
          items,
          total: calculateTotal(items)
        },
        initialized: true,
        loading: false 
      });
      toast.error("Failed to load your cart. Please try again.");
    }
  },

  addItem: async (newItem) => {
    try {
      const quantity = newItem.quantity || 1;
      const currentItems = get().cart.items;
      const existingItem = currentItems.find(item => item.productId === newItem.productId);

      // Set loading state for this item
      set(state => ({
        loadingItems: new Set(state.loadingItems).add(newItem.productId)
      }));

      // Try API first
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, quantity })
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        set(state => ({ 
          cart: {
            items,
            total: calculateTotal(items)
          },
          loadingItems: new Set([...state.loadingItems].filter(id => id !== newItem.productId))
        }));
        toast.success(existingItem ? 'Cart updated' : 'Added to cart');
      } else {
        // Fallback to localStorage
        let updatedItems;
        if (existingItem) {
          updatedItems = currentItems.map(item =>
            item.productId === newItem.productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedItems = [...currentItems, { ...newItem, quantity }];
        }
        
        set(state => ({ 
          cart: {
            items: updatedItems,
            total: calculateTotal(updatedItems)
          },
          loadingItems: new Set([...state.loadingItems].filter(id => id !== newItem.productId))
        }));
        syncWithLocalStorage(updatedItems);
        toast.success(existingItem ? 'Cart updated' : 'Added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      set(state => ({
        loadingItems: new Set([...state.loadingItems].filter(id => id !== newItem.productId))
      }));
      toast.error('Failed to update cart');
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    try {
      // If quantity is 0 or less, remove the item
      if (quantity <= 0) {
        // Update the UI immediately for smoother transition
        const currentItems = get().cart.items;
        const itemToRemove = currentItems.find(item => item.productId === productId);
        
        if (itemToRemove) {
          // Update local state first for immediate feedback
          set({ 
            cart: {
              items: currentItems.map(item => 
                item.productId === productId 
                  ? { ...item, quantity: 0 }
                  : item
              ),
              total: calculateTotal(currentItems.filter(item => item.productId !== productId))
            }
          });
        }
        
        await get().removeItem(productId);
        return;
      }

      // Set loading state for this item
      set(state => ({
        loadingItems: new Set(state.loadingItems).add(productId)
      }));

      // Get current item to show proper toast message
      const currentItems = get().cart.items;
      const currentItem = currentItems.find(item => item.productId === productId);
      const isIncrease = currentItem && quantity > currentItem.quantity;

      // Update local state immediately for smooth UI
      set({ 
        cart: {
          items: currentItems.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          ),
          total: calculateTotal(currentItems.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          ))
        }
      });

      // Try API first
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        set(state => ({ 
          cart: {
            items,
            total: calculateTotal(items)
          },
          loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
        }));
        if (quantity !== 0) { // Don't show toast for intermediate steps
          toast.success(isIncrease ? 'Quantity increased' : 'Quantity decreased');
        }
      } else {
        // Fallback to localStorage
        const updatedItems = currentItems.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        );
        
        set(state => ({ 
          cart: {
            items: updatedItems,
            total: calculateTotal(updatedItems)
          },
          loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
        }));
        syncWithLocalStorage(updatedItems);
        if (quantity !== 0) { // Don't show toast for intermediate steps
          toast.success(isIncrease ? 'Quantity increased' : 'Quantity decreased');
        }
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      set(state => ({
        loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
      }));
      toast.error('Failed to update quantity');
    }
  },

  removeItem: async (productId: string) => {
    try {
      // Set loading state for this item
      set(state => ({
        loadingItems: new Set(state.loadingItems).add(productId)
      }));

      // Get item name for toast message and update UI immediately
      const currentItems = get().cart.items;
      const itemToRemove = currentItems.find(item => item.productId === productId);
      
      // Update UI immediately for better responsiveness
      if (itemToRemove) {
        set({ 
          cart: {
            items: currentItems.filter(item => item.productId !== productId),
            total: calculateTotal(currentItems.filter(item => item.productId !== productId))
          }
        });
      }

      // Try API first
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        set(state => ({ 
          cart: {
            items,
            total: calculateTotal(items)
          },
          loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
        }));
        toast.success(itemToRemove ? `Removed ${itemToRemove.name}` : 'Item removed from cart');
      } else {
        // Fallback to localStorage
        const updatedItems = currentItems.filter(item => item.productId !== productId);
        set(state => ({ 
          cart: {
            items: updatedItems,
            total: calculateTotal(updatedItems)
          },
          loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
        }));
        syncWithLocalStorage(updatedItems);
        toast.success(itemToRemove ? `Removed ${itemToRemove.name}` : 'Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
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
          cart: { items: [], total: 0 },
          loading: false,
          loadingItems: new Set()
        });
        toast.success('Cart cleared');
      } else {
        // Fallback to localStorage
        set({ 
          cart: { items: [], total: 0 },
          loading: false,
          loadingItems: new Set()
        });
        syncWithLocalStorage([]);
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      set({ loading: false });
      toast.error('Failed to clear cart');
    }
  }
})); 