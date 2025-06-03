import { create } from 'zustand';
import { toast } from 'sonner';

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

interface WishlistStore {
  items: WishlistItem[];
  loading: boolean;
  loadingItems: Set<string>;
  initialized: boolean;
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  loadWishlist: () => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const syncWithLocalStorage = (items: WishlistItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }
};

const loadFromLocalStorage = (): WishlistItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      return [];
    }
  }
  return [];
};

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,
  loadingItems: new Set<string>(),
  initialized: false,

  loadWishlist: async () => {
    try {
      set({ loading: true });
      
      // Try to fetch from API first (for logged-in users)
      const response = await fetch('/api/wishlist');
      
      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        set({ 
          items,
          initialized: true,
          loading: false 
        });
      } else {
        // If API fails (guest user), load from localStorage
        const items = loadFromLocalStorage();
        set({ 
          items,
          initialized: true,
          loading: false 
        });
        
        // Show error message if it's not just an unauthorized error
        if (response.status !== 401) {
          const data = await response.json();
          toast.error(data.error || "Failed to load your wishlist");
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Fallback to localStorage on error
      const items = loadFromLocalStorage();
      set({ 
        items,
        initialized: true,
        loading: false 
      });
    }
  },

  addItem: async (newItem) => {
    try {
      const currentItems = get().items;
      
      // Check if item already exists
      if (currentItems.some(item => item.productId === newItem.productId)) {
        return;
      }

      // Set loading state for this item
      set(state => ({
        loadingItems: new Set(state.loadingItems).add(newItem.productId)
      }));

      // Try API first
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      if (response.ok) {
        const data = await response.json();
        set(state => ({ 
          items: data.items || [],
          loadingItems: new Set([...state.loadingItems].filter(id => id !== newItem.productId))
        }));
        toast.success('Added to wishlist');
      } else {
        // Fallback to localStorage
        const newItemWithDate = {
          ...newItem,
          addedAt: new Date().toISOString()
        };
        const updatedItems = [...currentItems, newItemWithDate];
        
        set(state => ({ 
          items: updatedItems,
          loadingItems: new Set([...state.loadingItems].filter(id => id !== newItem.productId))
        }));
        syncWithLocalStorage(updatedItems);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      set(state => ({
        loadingItems: new Set([...state.loadingItems].filter(id => id !== newItem.productId))
      }));
      toast.error('Failed to update wishlist');
    }
  },

  removeItem: async (productId: string) => {
    try {
      // Set loading state for this item
      set(state => ({
        loadingItems: new Set(state.loadingItems).add(productId)
      }));

      // Try API first
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        set(state => ({ 
          items: data.items || [],
          loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
        }));
        toast.success('Removed from wishlist');
      } else {
        // Fallback to localStorage
        const currentItems = get().items;
        const updatedItems = currentItems.filter(item => item.productId !== productId);
        
        set(state => ({ 
          items: updatedItems,
          loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
        }));
        syncWithLocalStorage(updatedItems);
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      set(state => ({
        loadingItems: new Set([...state.loadingItems].filter(id => id !== productId))
      }));
      toast.error('Failed to update wishlist');
    }
  },

  clearWishlist: async () => {
    try {
      set({ loading: true });

      // Try API first
      const response = await fetch('/api/wishlist', {
        method: 'DELETE'
      });

      if (response.ok) {
        set({ items: [], loading: false });
        toast.success('Wishlist cleared');
      } else {
        // Fallback to localStorage
        set({ items: [], loading: false });
        syncWithLocalStorage([]);
        toast.success('Wishlist cleared');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      set({ loading: false });
      toast.error('Failed to clear wishlist');
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.some(item => item.productId === productId);
  }
})); 