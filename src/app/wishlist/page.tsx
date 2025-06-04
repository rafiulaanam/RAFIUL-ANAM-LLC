"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { formatPrice } from "@/lib/utils";
import { Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function WishlistPage() {
  const {
    items,
    loading,
    loadingItems,
    removeItem,
    clearWishlist,
    loadWishlist,
  } = useWishlistStore();

  const { addItem: addToCart } = useCartStore();

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleAddToCart = async (item: any) => {
    await addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    toast.success("Added to cart");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
          <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
          <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
            <Link href="/shop">
            <Button>Continue Shopping</Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Wishlist</h1>
        <Button
          variant="destructive"
          onClick={clearWishlist}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
            <div
            key={item.productId}
            className="bg-card rounded-lg shadow-sm overflow-hidden border"
            >
            <div className="relative aspect-square">
                  <Image
                src={item.image}
                alt={item.name}
                    fill
                className="object-cover"
                  />
                </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2">{item.name}</h3>
              <p className="text-lg font-bold mb-4">{formatPrice(item.price)}</p>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1 flex items-center gap-2"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                  <Button
                  variant="destructive"
                    size="icon"
                  disabled={loadingItems.has(item.productId)}
                  onClick={() => removeItem(item.productId)}
                  >
                  {loadingItems.has(item.productId) ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
} 