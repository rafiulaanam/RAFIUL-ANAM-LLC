"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  lowStockThreshold: number;
  brand: string;
  sku?: string;
  isPublished: boolean;
  isFeatured: boolean;
  trackInventory: boolean;
  images: string[];
  categoryId: string;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
}

export default function VendorProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products/vendor");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setIsDeleting(productId);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Product deleted successfully");
    setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId)
        );
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-500">Manage your product listings</p>
        </div>
        <Button asChild>
        <Link href="/vendor/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
          </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>
            A list of all your products. Click on a product to edit it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center space-y-3 text-center">
              <div className="text-sm text-gray-500">
                You haven&apos;t added any products yet
          </div>
              <Button asChild variant="outline">
                <Link href="/vendor/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Link>
              </Button>
          </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product Details</TableHead>
                  <TableHead>Inventory</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-gray-100" />
                      )}
                    </TableCell>
                  <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.description.length > 100
                            ? `${product.description.slice(0, 100)}...`
                            : product.description}
                        </p>
                        <p className="text-sm text-gray-500">SKU: {product.sku || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{product.stock} in stock</p>
                        {product.trackInventory && (
                          <p className="text-sm text-gray-500">
                            Low stock alert at {product.lowStockThreshold}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">${product.price.toFixed(2)}</p>
                        {product.comparePrice && (
                          <p className="text-sm text-gray-500 line-through">
                            ${product.comparePrice.toFixed(2)}
                          </p>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                      <div className="space-y-1">
                        <Badge
                          variant={product.isPublished ? "default" : "secondary"}
                        >
                          {product.isPublished ? "Published" : "Draft"}
                        </Badge>
                        {product.isFeatured && (
                          <Badge variant="outline" className="ml-1">
                            Featured
                    </Badge>
                        )}
                      </div>
                  </TableCell>
                  <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/vendor/products/${product._id}/edit`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isDeleting === product._id}
                          onClick={() => handleDelete(product._id)}
                        >
                          {isDeleting === product._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 