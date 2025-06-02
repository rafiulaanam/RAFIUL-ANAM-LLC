"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Check, Plus, Minus } from "lucide-react";
import { useShop } from "@/contexts/shop-context";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
  brand: string;
  rating: number;
  reviews: number;
}

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export default function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const { 
    isInWishlist, 
    toggleWishlist, 
    addToCart, 
    isInCart,
    getCartItemQuantity,
    updateCartQuantity,
    state 
  } = useShop();
  
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addToCart(product, 1);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      // Reset the adding state after 2 seconds
      setTimeout(() => {
        setIsAdding(false);
      }, 2000);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartQuantity(product._id, newQuantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const quantity = getCartItemQuantity(product._id);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border dark:border-gray-700">
      <Link href={`/products/${product._id}`}>
        <div className="relative h-64 overflow-hidden">
          <Image
            src={product.images[0] || '/placeholder-image.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Button
            size="icon"
            variant="ghost"
            className={`absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 ${
              isInWishlist(product._id) ? "text-red-500" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product._id);
            }}
          >
            <Heart
              className="h-5 w-5"
              fill={isInWishlist(product._id) ? "currentColor" : "none"}
            />
          </Button>
        </div>
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {product.category.name}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({product.reviews})
            </span>
          </div>
        </div>
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">${product.price}</span>
          {showAddToCart && (
            <div className="flex items-center gap-2">
              {isInCart(product._id) ? (
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpdateQuantity(quantity - 1);
                    }}
                    disabled={quantity <= 1 || state.isLoading}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpdateQuantity(quantity + 1);
                    }}
                    disabled={state.isLoading}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart();
                  }}
                  disabled={isAdding || state.isLoading}
                  className="relative"
                >
                  {isAdding ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Added
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 