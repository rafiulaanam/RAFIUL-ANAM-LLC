"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Check, PackageOpen } from "lucide-react";
import { useShop } from "@/contexts/shop-context";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  rating: number;
  images: string[];
  category: string;
  description: string;
  featured: boolean;
  quantity: number;
}

interface ApiResponse {
  products: Product[];
  message?: string;
  error?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [addedProducts, setAddedProducts] = useState<{ [key: string]: boolean }>({});
  const { addToCart } = useShop();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products/featured");
        const data: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch products");
        }

        setProducts(data.products);
        setMessage(data.message || null);
        setError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error instanceof Error ? error.message : "Failed to load products");
        setProducts([]);
        toast({
          title: "Error",
          description: "Failed to load featured products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1
    });
    
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

  if (loading) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading featured products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <PackageOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold mb-2">No Products Available</h2>
            <p className="text-muted-foreground mb-4">
              {message || "There are no products available in the shop at the moment."}
            </p>
            {/* If you're an admin, show link to add products */}
            <Button asChild variant="outline">
              <Link href="/shop">
                Browse Shop
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover our handpicked selection of premium products that define quality and style.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden group"
            >
              <Link href={`/products/${product._id}`}>
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                <Link href={`/products/${product._id}`}>
                  <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm">{product.rating}</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleAddToCart(product)}
                  disabled={addedProducts[product._id] || product.quantity === 0}
                >
                  {addedProducts[product._id] ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Added to Cart
                    </>
                  ) : product.quantity === 0 ? (
                    "Out of Stock"
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/shop">
            <Button size="lg" variant="outline">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 