"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Check, Plus, Minus, Star } from "lucide-react";
import { useShop } from "@/contexts/shop-context";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";

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
  const [localQuantity, setLocalQuantity] = useState(0);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addToCart(product, 1);
      setLocalQuantity(1); // Set local quantity immediately
      toast({
        title: "✔ Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch {
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
      setLocalQuantity(newQuantity); // Update local quantity immediately
      await updateCartQuantity(product._id, newQuantity);
    } catch {
      setLocalQuantity(quantity); // Reset to server quantity on error
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const quantity = getCartItemQuantity(product._id);

  // Update local quantity when server quantity changes
  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border dark:border-gray-700">
      <Link href={`/products/${product._id}`}>
        <div className="relative h-64 overflow-hidden">
          <Image
            src={product.images[0] || '/images/product.png'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600">
                New
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">
                Best Seller
              </Badge>
            )}
            {product.comparePrice && product.comparePrice > product.price && (
              <Badge variant="secondary" className="bg-red-500 text-white hover:bg-red-600">
                Sale
              </Badge>
            )}
          </div>
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
            {product.category?.name || product.brand}
          </span>
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              {product.reviewCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
          {showAddToCart && (
            <div className="flex items-center gap-2">
              {isInCart(product._id) ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        handleUpdateQuantity(localQuantity - 1);
                      }}
                      disabled={localQuantity <= 1 || state.isLoading}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{localQuantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        handleUpdateQuantity(localQuantity + 1);
                      }}
                      disabled={state.isLoading}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">in cart</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
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
                  {isAdding && <span className="text-sm text-muted-foreground">Qty: 1</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 