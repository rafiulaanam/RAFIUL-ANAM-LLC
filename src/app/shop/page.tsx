import { Suspense } from "react";
import ProductGrid from "@/components/shop/product-grid";
import ProductFilters from "@/components/shop/product-filters";
import ProductSort from "@/components/shop/product-sort";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ShopProvider } from "@/contexts/shop-context";
import SearchInput from "@/components/shop/search-input";

export default function ShopPage() {
  return (
    <ShopProvider>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              All Products
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse through our collection of high-quality products.
            </p>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <SearchInput />
            <ProductSort />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="lg:col-span-1">
              <ProductFilters />
            </div>

            {/* Product Grid */}
            <div className="lg:col-span-3">
              <Suspense fallback={<div>Loading products...</div>}>
                <ProductGrid />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </ShopProvider>
  );
} 