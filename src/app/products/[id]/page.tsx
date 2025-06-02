"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart, Minus, Plus, Star, ShoppingCart, Check } from "lucide-react";
import { useShop } from "@/contexts/shop-context";
import { useToast } from "@/components/ui/use-toast";
import { useCartStore } from "@/store/useCartStore";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: {
    _id: string;
    name: string;
  } | null;
  brand: string | null;
  rating: number;
  reviews: number;
  description: string;
}

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const {
    isInWishlist,
    toggleWishlist,
  } = useShop();

  const { loading: cartLoading, addItem, updateQuantity, cart } = useCartStore();
  const { toast } = useToast();

  // Get cart item details
  const cartItem = product ? cart?.items?.find(item => item.productId === product._id) : null;
  const quantity = cartItem?.quantity || 0;
  const isInCart = Boolean(cartItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch product");
        }
        const data = await response.json();
        // Ensure images is always an array
        const productData = {
          ...data,
          images: Array.isArray(data.images) ? data.images : data.image ? [data.image] : ['/placeholder-image.jpg']
        };
        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load product",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, toast]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setIsAdding(true);
      await addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      // Reset after 2 seconds
      setTimeout(() => {
        setIsAdding(false);
      }, 2000);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (!product || newQuantity < 1) return;
    
    try {
      await updateQuantity(product._id, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-[500px] rounded-xl overflow-hidden bg-white">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all bg-white ${
                      selectedImage === index
                        ? 'border-primary ring-2 ring-primary ring-opacity-50'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">
                    ({product.reviews} reviews)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={isInWishlist(product._id) ? "text-red-500" : ""}
                  onClick={() => toggleWishlist(product._id)}
                >
                  <Heart className="h-5 w-5" fill={isInWishlist(product._id) ? "currentColor" : "none"} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-2xl font-bold">${product.price}</div>
              {product.category && (
                <div className="text-sm text-muted-foreground">
                  Category: <span className="capitalize">{product.category.name}</span>
                </div>
              )}
              {product.brand && (
                <div className="text-sm text-muted-foreground">
                  Brand: <span className="capitalize">{product.brand}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isInCart ? (
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateQuantity(quantity - 1)}
                    disabled={quantity <= 1 || cartLoading}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateQuantity(quantity + 1)}
                    disabled={cartLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isAdding || cartLoading}
                >
                  {isAdding ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h3>Product Description</h3>
              <p>{product.description}</p>
              <h3>Features</h3>
              <ul>
                <li>High-quality materials</li>
                <li>Durable construction</li>
                <li>Premium finish</li>
                <li>Satisfaction guaranteed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 