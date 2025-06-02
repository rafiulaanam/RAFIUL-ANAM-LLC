"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Star, ShoppingCart, Eye } from "lucide-react";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  brand: string;
  rating?: number;
  reviewCount?: number;
  categoryId: string;
  vendorId: string;
  vendor?: {
    name: string;
    _id: string;
  };
  category?: {
    name: string;
    _id: string;
  };
}

interface Category {
  _id: string;
  name: string;
}

interface FilterState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  brand: string;
  sort: string;
}

const ITEMS_PER_PAGE = 12;

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: Number(searchParams.get("minPrice")) || 0,
    maxPrice: Number(searchParams.get("maxPrice")) || 1000,
    brand: searchParams.get("brand") || "",
    sort: searchParams.get("sort") || "newest"
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async (reset = false) => {
      try {
        if (reset) {
          setIsLoading(true);
          setProducts([]);
          setPage(1);
          setHasMore(true);
        }

        const queryParams = new URLSearchParams({
          page: reset ? "1" : page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          ...(filters.search && { search: filters.search }),
          ...(filters.category && { category: filters.category }),
          ...(filters.brand && { brand: filters.brand }),
          ...(filters.minPrice > 0 && { minPrice: filters.minPrice.toString() }),
          ...(filters.maxPrice < 1000 && { maxPrice: filters.maxPrice.toString() }),
          ...(filters.sort && { sort: filters.sort })
        });

        const response = await fetch(`/api/products/search?${queryParams}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch products");
        }
        
        if (reset) {
          setProducts(data.products);
        } else {
          setProducts(prev => [...prev, ...data.products]);
        }
        
        setHasMore(data.hasMore);
        
        // Extract unique brands
        if (data.products && data.products.length > 0) {
          const uniqueBrands = Array.from(
            new Set(data.products.map((p: Product) => p.brand))
          ).filter(Boolean);
          setBrands(prev => Array.from(new Set([...prev, ...uniqueBrands])));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load products");
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Reset and fetch when filters change
    fetchProducts(true);
  }, [filters, page]);

  // Load more products when scrolling
  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [inView, isLoading, hasMore]);

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange("search", filters.search);
  };

  const renderStars = (rating: number = 0) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.round(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-none border-r bg-white p-6">
        <div className="space-y-6">
          {/* Search */}
          <div>
            <h3 className="mb-2 font-semibold">Search</h3>
            <form onSubmit={handleSearch} className="flex space-x-2">
              <Input
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-2 font-semibold">Categories</h3>
            <div className="space-y-1">
              <Button
                variant={filters.category === "" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleFilterChange("category", "")}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category._id}
                  variant={filters.category === category._id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleFilterChange("category", category._id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="mb-2 font-semibold">Price Range</h3>
            <div className="space-y-4">
              <Slider
                defaultValue={[filters.minPrice, filters.maxPrice]}
                max={1000}
                step={10}
                onValueChange={([min, max]) => {
                  setFilters(prev => ({
                    ...prev,
                    minPrice: min,
                    maxPrice: max
                  }));
                }}
                onValueCommit={([min, max]) => {
                  handleFilterChange("minPrice", min);
                  handleFilterChange("maxPrice", max);
                }}
              />
              <div className="flex justify-between text-sm">
                <span>${filters.minPrice}</span>
                <span>${filters.maxPrice}</span>
              </div>
            </div>
            </div>

          {/* Brands */}
          <div>
            <h3 className="mb-2 font-semibold">Brands</h3>
            <div className="space-y-1">
              <Button
                variant={filters.brand === "" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleFilterChange("brand", "")}
              >
                All Brands
              </Button>
              {brands.map((brand) => (
                <Button
                  key={brand}
                  variant={filters.brand === brand ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleFilterChange("brand", brand)}
                >
                  {brand}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Shop</h1>
          <Select
            value={filters.sort}
            onValueChange={(value) => handleFilterChange("sort", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Best Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {isLoading && products.length === 0 ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <Card key={product._id} className="overflow-hidden">
                  <div className="relative aspect-square">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                    {product.comparePrice && product.comparePrice > product.price && (
                      <Badge className="absolute left-2 top-2 bg-red-500">
                        Sale
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-1">
                      {renderStars(product.rating)}
                      {product.reviewCount && (
                        <span className="text-sm text-gray-500">
                          ({product.reviewCount})
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold">${product.price}</span>
                        {product.comparePrice && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ${product.comparePrice}
                          </span>
                        )}
                      </div>
                      {product.vendor?.name && (
                        <span className="text-sm text-gray-500">
                          {product.vendor.name}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button
                        className="flex-1"
                        onClick={() => router.push(`/products/${product._id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button className="flex-1">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div
                ref={ref}
                className="mt-8 flex items-center justify-center"
              >
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}

            {/* No Products */}
            {!isLoading && products.length === 0 && (
              <div className="flex h-96 flex-col items-center justify-center space-y-4">
                <p className="text-lg text-gray-500">No products found</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      search: "",
                      category: "",
                      minPrice: 0,
                      maxPrice: 1000,
                      brand: "",
                      sort: "newest"
                    });
                    router.push("/shop");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 