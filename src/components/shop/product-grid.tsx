"use client";

import { useEffect, useState, useCallback } from "react";
import { useShop } from "@/contexts/shop-context";
import ProductCard from "@/components/shop/product-card";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/types";
import { useSession } from "next-auth/react";

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const {
    searchQuery,
    priceRange,
    selectedCategories,
    selectedBrands,
    selectedRating,
    sortOption,
    status,
  } = useShop();
  const { toast } = useToast();
  const { data: session } = useSession();

  const fetchProducts = useCallback(async (pageNum: number, append = false) => {
    try {
      setLoadingMore(append);
      if (!append) setLoading(true);

      const queryParams = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategories.length > 0 && { category: selectedCategories.join(',') }),
        ...(selectedBrands.length > 0 && { brand: selectedBrands.join(',') }),
        ...(selectedRating && { minRating: selectedRating.toString() }),
        ...(sortOption && { sort: sortOption }),
        ...(status && (session?.user?.role === "ADMIN" || session?.user?.role === "VENDOR") && { status }),
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        page: pageNum.toString(),
        limit: "12",
      });

      const response = await fetch(`/api/products?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      
      if (append) {
        setProducts(prev => [...prev, ...data.products]);
      } else {
        setProducts(data.products);
      }
      
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, priceRange, selectedCategories, selectedBrands, selectedRating, sortOption, status, session?.user?.role, toast]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [fetchProducts]);

  const loadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-lg h-96" />
        ))}
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      
      {page < totalPages && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
} 