"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { ProductList } from "@/components/admin/products/product-list";
import { ProductForm } from "@/components/admin/products/product-form";
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [duplicatingProductId, setDuplicatingProductId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Fetch products on component mount and when page changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery]);

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '5',
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/products?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setProducts(result.data);
        // If we implement pagination later, we can use these
        // setTotalPages(Math.ceil(result.data.length / 5));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (productId: string) => {
    try {
      setDuplicatingProductId(productId);
      const response = await fetch(`/api/products/${productId}/duplicate`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to duplicate product');
      }

      if (result.success) {
        setProducts([...products, result.data]);
        toast({
          title: "Success",
          description: "Product duplicated successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate product",
        variant: "destructive",
      });
    } finally {
      setDuplicatingProductId(null);
    }
  };

  // CRUD operations
  const handleCreateProduct = async (data: Omit<Product, '_id'>) => {
    try {
      setIsSubmitting(true);
      console.log('Sending product data:', data); // Debug the data being sent
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json() as ApiResponse<Product>;
      console.log('Server response:', { status: response.status, result }); // Debug the response
      
      if (!response.ok) {
        const errorMessage = `Server error (${response.status}): ${result.error || 'Unknown error'}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      if (result.success && result.data) {
        setProducts([...products, result.data]);
        setIsFormOpen(false);
        
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      } else {
        const errorMessage = 'Failed to create product: ' + (result.error || 'Unknown error');
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Create product error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (data: Product) => {
    try {
      setIsSubmitting(true);
      if (!data._id) {
        throw new Error("Product ID is missing");
      }

      const response = await fetch(`/api/products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: data._id,
          name: data.name,
          description: data.description,
          price: data.price,
          image: data.image,
          category: data.category,
          brand: data.brand,
          inventory: data.inventory,
          isActive: data.isActive
        }),
      });

      const result = await response.json();
      console.log('Update response:', result);
      
      if (!response.ok) {
        const errorMessage = result.error || `Server error: ${response.status}`;
        console.error('Server error:', { status: response.status, result });
        throw new Error(errorMessage);
      }
      
      if (result.success) {
        setProducts(products.map((p) => (p._id === data._id ? result.data : p)));
        setIsFormOpen(false);
        setSelectedProduct(null);
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        console.error('API error:', result);
        throw new Error(result.error || 'Failed to update product');
      }
    } catch (error: any) {
      console.error('Update product error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const productToDelete = products.find((p) => p._id === productId);
    if (productToDelete) {
      setSelectedProduct(productToDelete);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!selectedProduct?._id) return;

    try {
      setDeletingProductId(selectedProduct._id);
      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');
      
      const result = await response.json();
      if (result.success) {
        setProducts(products.filter((p) => p._id !== selectedProduct._id));
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
        
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory here.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <ProductList
            key={product._id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDeleteProduct}
            onDuplicate={handleDuplicate}
            isDeleting={deletingProductId === product._id}
            isDuplicating={duplicatingProductId === product._id}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {renderPagination()}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="sticky top-0 z-10 bg-background px-6 py-4 border-b">
            <DialogTitle>
              {selectedProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? "Update the product details below."
                : "Fill in the product details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ProductForm
              initialData={selectedProduct || undefined}
              onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedProduct(null);
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product {selectedProduct?.name} and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setSelectedProduct(null)}
              disabled={deletingProductId === selectedProduct?._id}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletingProductId === selectedProduct?._id}
              className={cn(
                deletingProductId === selectedProduct?._id && 
                "opacity-50 cursor-not-allowed"
              )}
            >
              {deletingProductId === selectedProduct?._id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 