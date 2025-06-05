import { CartItem, Product } from "@/types";

export const CartService = {
  // Add item to cart
  addToCart: async (product: Product, quantity: number = 1, userId?: string) => {
    if (userId) {
      // If user is logged in, save to database
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product._id, quantity }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add item to cart');
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
      }
    }

    // Always update local storage
    const cart = CartService.getLocalCart();
    const existingItem = cart[product._id];

    const updatedCart = {
      ...cart,
      [product._id]: {
        ...product,
        quantity: existingItem ? existingItem.quantity + quantity : quantity,
      },
    };

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    return updatedCart;
  },

  // Get cart from local storage
  getLocalCart: (): { [key: string]: CartItem } => {
    if (typeof window === 'undefined') return {};
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : {};
  },

  // Remove item from cart
  removeFromCart: async (productId: string, userId?: string) => {
    if (userId) {
      // If user is logged in, remove from database
      try {
        const response = await fetch(`/api/cart/${productId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove item from cart');
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
      }
    }

    // Always update local storage
    const cart = CartService.getLocalCart();
    const updatedCart = Object.fromEntries(
      Object.entries(cart).filter(([key]) => key !== productId)
    );
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    return updatedCart;
  },

  // Update item quantity
  updateQuantity: async (productId: string, quantity: number, userId?: string) => {
    if (userId) {
      // If user is logged in, update in database
      try {
        const response = await fetch(`/api/cart/${productId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update cart');
        }
      } catch (error) {
        console.error('Error updating cart:', error);
        throw error;
      }
    }

    // Always update local storage
    const cart = CartService.getLocalCart();
    if (quantity <= 0) {
      return CartService.removeFromCart(productId, userId);
    }

    const updatedCart = {
      ...cart,
      [productId]: {
        ...cart[productId],
        quantity,
      },
    };

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    return updatedCart;
  },

  // Clear cart
  clearCart: async (userId?: string) => {
    if (userId) {
      // If user is logged in, clear in database
      try {
        const response = await fetch('/api/cart', {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to clear cart');
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
      }
    }

    // Always clear local storage
    localStorage.removeItem('cart');
    return {};
  },
}; 