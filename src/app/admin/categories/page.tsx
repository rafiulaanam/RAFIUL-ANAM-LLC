"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, ImagePlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
import ImageUpload from "@/components/ui/image-upload";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  image?: string;
  status: "active" | "inactive";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    status: "active" as "active" | "inactive",
  });
  const { toast } = useToast();
  const [productsUsingCategory, setProductsUsingCategory] = useState<Array<{
    _id: string;
    name: string;
    status: string;
    isPublished: boolean;
  }>>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedCategory
        ? `/api/admin/categories`
        : "/api/admin/categories";
      const method = selectedCategory ? "PATCH" : "POST";
      const body = selectedCategory
        ? { ...formData, id: selectedCategory._id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (selectedCategory ? "Failed to update category" : "Failed to create category"));
      }

      const data = await response.json();
      
      if (selectedCategory) {
        setCategories(categories.map(cat => 
          cat._id === selectedCategory._id ? data : cat
        ));
      } else {
        setCategories([...categories, data]);
      }
      
      setIsOpen(false);
      setFormData({ name: "", description: "", image: "", status: "active" });
      setSelectedCategory(null);
      
      toast({
        title: "Success",
        description: selectedCategory
          ? "Category updated successfully"
          : "Category created successfully",
      });
    } catch (error) {
      console.error("Error submitting category:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      status: category.status || "active",
    });
    setIsOpen(true);
  };

  const checkProductsUsingCategory = async (categoryId: string) => {
    try {
      const response = await fetch(
        `/api/admin/categories?checkProducts=true&categoryId=${encodeURIComponent(categoryId)}`
      );
      const data = await response.json();
      if (response.ok && data.productsUsingCategory) {
        setProductsUsingCategory(data.productsUsingCategory);
        return data.productsUsingCategory.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error checking products:", error);
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // First check if category has products
      const hasProducts = await checkProductsUsingCategory(id);
      if (hasProducts) {
        toast({
          title: "Cannot Delete Category",
          description: "This category is being used by products. Please see the list of products below.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      const encodedId = encodeURIComponent(id);
      const response = await fetch(`/api/admin/categories?id=${encodedId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      setCategories(categories.filter((cat) => cat._id !== id));
      setIsDeleteDialogOpen(false);
      setProductsUsingCategory([]);
      
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  // Update the DeleteConfirmationDialog component
  const DeleteConfirmationDialog = ({ category, isOpen, onClose }: { 
    category: Category; 
    isOpen: boolean; 
    onClose: () => void;
  }) => (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to delete the category &quot;{category?.name}&quot;? This action cannot be undone.
            </p>
            
            {productsUsingCategory.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-red-600 mb-2">
                  This category cannot be deleted because it is being used by the following products:
                </p>
                <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                  <ul className="space-y-2">
                    {productsUsingCategory.map((product) => (
                      <li key={product._id} className="flex items-center justify-between text-sm">
                        <span>{product.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  To delete this category, you must first reassign or delete these products.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (category) {
                handleDelete(category._id);
              }
            }}
            className="bg-red-600 hover:bg-red-700"
            disabled={productsUsingCategory.length > 0}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories here
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedCategory(null);
              setFormData({ name: "", description: "", image: "", status: "active" });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? "Edit Category" : "Create New Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-6 -mr-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter category description"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image</Label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    onRemove={() => setFormData({ ...formData, image: "" })}
                    type="categories"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "active" | "inactive" })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" onClick={handleSubmit} disabled={!formData.name}>
                {selectedCategory ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.length === 0 ? (
            <div className="col-span-full flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
              <div className="text-center">
                <ImagePlus className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">No categories found</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSelectedCategory(null);
                    setFormData({ name: "", description: "", image: "", status: "active" });
                    setIsOpen(true);
                  }}
                  className="mt-2"
                >
                  Add your first category
                </Button>
              </div>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className="group relative overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="absolute right-4 top-4 z-10 flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-red-50 hover:text-red-600"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {category.image ? (
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/5" />
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] relative overflow-hidden bg-muted/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImagePlus className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  </div>
                )}

                <div className="space-y-2.5 p-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold leading-none tracking-tight">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      category.status === "active" 
                        ? 'bg-green-50 text-green-700 ring-green-600/20' 
                        : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                    }`}>
                      <span className={`mr-1 h-1.5 w-1.5 rounded-full ${
                        category.status === "active" 
                          ? 'bg-green-600' 
                          : 'bg-yellow-600'
                      }`} />
                      {category.status === "active" ? "Active" : "Inactive"}
                    </span>

                    <div className="text-xs text-muted-foreground">
                      {/* You can add additional metadata here, like product count */}
                      {/* Example: {category.productCount} products */}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add the delete confirmation dialog */}
      {selectedCategory && (
        <DeleteConfirmationDialog
          category={selectedCategory}
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
} 