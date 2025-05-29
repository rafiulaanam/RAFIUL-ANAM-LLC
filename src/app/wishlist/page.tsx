"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Trash2 } from "lucide-react";
import { useShop } from "@/contexts/shop-context";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
}

export default function WishlistPage() {
  const { wishlist, wishlistProducts, toggleWishlist, addToCart } = useShop();
  const [addedProducts, setAddedProducts] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedProducts(prev => ({ ...prev, [product._id]: true }));
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
    
    // Reset the added state after 2 seconds
    setTimeout(() => {
      setAddedProducts(prev => ({ ...prev, [product._id]: false }));
    }, 2000);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Browse our products and add your favorites to the wishlist.
            </p>
            <Link href="/shop">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border dark:border-gray-700"
            >
              <Link href={`/products/${product._id}`}>
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {product.category}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleWishlist(product._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Link href={`/products/${product._id}`}>
                  <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">${product.price}</span>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={addedProducts[product._id]}
                  >
                    {addedProducts[product._id] ? (
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 