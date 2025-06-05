"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Check, X, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import type { Product } from "@/types/product";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<{ _id: string; name: string; }[]>([]);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
      });

      console.log("Fetching products with params:", queryParams.toString());
      
      const response = await fetch(`/api/products?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || data.error || "Failed to fetch products"
        );
      }

      if (!Array.isArray(data.products)) {
        throw new Error("Invalid response format: products is not an array");
      }

      setProducts(data.products);
      console.log(`Loaded ${data.products.length} products`);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch products",
        variant: "destructive",
      });
      setProducts([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, categoryFilter, toast]);

  const fetchCategories = useCallback(async () => {
    try {
      setIsCategoriesLoading(true);
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
      setCategories([]);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select products to perform this action",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/products/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          productIds: selectedProducts,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      await fetchProducts();
      setSelectedProducts([]);
      toast({
        title: "Success",
        description: `Successfully ${action}ed selected products`,
      });
    } catch (error) {
      console.error(`Error ${action}ing products:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} products`,
        variant: "destructive",
      });
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllProducts = () => {
    setSelectedProducts((prev) =>
      prev.length === products.length ? [] : products.map((p) => p._id)
    );
  };

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <p className="text-muted-foreground">
          Review and manage all vendor products
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={categoryFilter} 
            onValueChange={setCategoryFilter}
            disabled={isCategoriesLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                isCategoriesLoading 
                  ? "Loading categories..." 
                  : "Filter by category"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedProducts.length === products.length}
              onCheckedChange={toggleAllProducts}
            />
            <span className="text-sm text-muted-foreground">
              {selectedProducts.length} selected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("approve")}
              disabled={selectedProducts.length === 0}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("reject")}
              disabled={selectedProducts.length === 0}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("feature")}
              disabled={selectedProducts.length === 0}
            >
              <Star className="mr-2 h-4 w-4" />
              Feature
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction("delete")}
              disabled={selectedProducts.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectedProducts.includes(product._id)}
                  onCheckedChange={() => toggleProductSelection(product._id)}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{product.name}</h3>
                    {product.isFeatured && (
                      <Star className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    by {product.vendor.name}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="outline">${product.price.toFixed(2)}</Badge>
                    <Badge variant="outline">{product.category.name}</Badge>
                    <Badge
                      variant={
                        product.status === "approved"
                          ? "success"
                          : product.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {product.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction("approve")}
                  disabled={product.status === "approved"}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction("reject")}
                  disabled={product.status === "rejected"}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction("feature")}
                >
                  <Star
                    className={`h-4 w-4 ${
                      product.isFeatured ? "text-yellow-500" : ""
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
} 