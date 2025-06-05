"use client";

import { useEffect, useState } from "react";
import { useShop } from "@/contexts/shop-context";
import ProductCard from "@/components/shop/product-card";
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

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    searchQuery,
    priceRange,
    selectedCategories,
    selectedBrands,
    selectedRating,
    sortOption,
  } = useShop();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const queryParams = new URLSearchParams({
          ...(searchQuery && { search: searchQuery }),
          ...(selectedCategories.length > 0 && { category: selectedCategories.join(',') }),
          ...(selectedBrands.length > 0 && { brand: selectedBrands.join(',') }),
          ...(selectedRating && { minRating: selectedRating.toString() }),
          ...(sortOption && { sortBy: sortOption }),
          minPrice: priceRange[0].toString(),
          maxPrice: priceRange[1].toString(),
        });

        const response = await fetch(`/api/products?${queryParams}`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data.items);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, priceRange, selectedCategories, selectedBrands, selectedRating, sortOption, toast]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No Products Found</h2>
        <p className="text-muted-foreground">
          Try adjusting your filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
} 