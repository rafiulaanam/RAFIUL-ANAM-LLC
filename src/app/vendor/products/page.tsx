"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Copy, ChevronLeft, ChevronRight } from "lucide-react";
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

const PAGE_SIZES = [10, 20, 30, 50];

export default function VendorProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    const size = Number(searchParams.get("size")) || 10;
    setCurrentPage(page);
    setPageSize(size);
    fetchProducts(page, size);
  }, [searchParams]);

  const fetchProducts = async (page: number, size: number) => {
    try {
      const response = await fetch(`/api/products/vendor?page=${page}&limit=${size}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data.products);
      setTotalProducts(data.total);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalProducts / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handlePageSizeChange = (newSize: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("size", newSize);
    params.set("page", "1"); // Reset to first page when changing page size
    router.push(`?${params.toString()}`);
  };

  const handleDuplicate = async (productId: string) => {
    setIsDuplicating(productId);
    try {
      const response = await fetch(`/api/products/${productId}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        const newProduct = await response.json();
        toast.success("Product duplicated successfully");
        setProducts((prevProducts) => [...prevProducts, newProduct]);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate product");
      }
    } catch (error) {
      console.error("Error duplicating product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to duplicate product");
    } finally {
      setIsDuplicating(null);
    }
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(productToDelete._id);
    try {
      const response = await fetch(`/api/products/${productToDelete._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Product deleted successfully");
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productToDelete._id)
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
      setDeleteDialogOpen(false);
      setProductToDelete(null);
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>
                A list of all your products. Click on a product to edit it.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Items per page:</p>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
            <>
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
                            onClick={() => handleDuplicate(product._id)}
                            disabled={isDuplicating === product._id}
                          >
                            {isDuplicating === product._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(product)}
                            disabled={isDeleting === product._id}
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
              
              <div className="mt-4 flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, totalProducts)} to{" "}
                  {Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} products
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current page
                        const nearCurrent = Math.abs(page - currentPage) <= 1;
                        const isFirstPage = page === 1;
                        const isLastPage = page === totalPages;
                        return nearCurrent || isFirstPage || isLastPage;
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8"
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product &quot;{productToDelete?.name}&quot;. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 