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
import { Loader2, Search, Star, ShoppingCart, Eye, Check, Plus, Minus, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

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

interface WishlistState {
  [key: string]: boolean;
}

const ITEMS_PER_PAGE = 12;
const PAGE_SIZES = [12, 24, 36, 48];

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const { ref, inView } = useInView();
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  const [localQuantities, setLocalQuantities] = useState<{ [key: string]: number }>({});
  const [selectedBrand, setSelectedBrand] = useState("");
  const [wishlist, setWishlist] = useState<WishlistState>({});

  const { cart, addItem, updateQuantity, loading: cartLoading } = useCartStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist, loadWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    const size = Number(searchParams.get("size")) || 12;
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("q") || "";
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || 1000;

    setCurrentPage(page);
    setPageSize(size);
    setSelectedCategory(category);
    setSortBy(sort);
    setSearchQuery(search);
    setPriceRange([minPrice, maxPrice]);
    fetchProducts(page, size, category, sort, search, minPrice, maxPrice);
  }, [searchParams]);

  const fetchProducts = async (
    page: number,
    limit: number,
    category: string,
    sort: string,
    search: string,
    minPrice: number,
    maxPrice: number
  ) => {
    try {
        const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
        ...(sort && { sort }),
        ...(search && { q: search }),
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
        });

      const response = await fetch(`/api/products?${queryParams}`);
        if (!response.ok) {
        throw new Error("Failed to fetch products");
        }
        
      const data = await response.json();
          setProducts(data.products);
      setTotalProducts(data.total);
      setIsLoading(false);
      } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
        setIsLoading(false);
      }
    };

  const totalPages = Math.ceil(totalProducts / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateSearchParams({ page: newPage.toString() });
  };

  const handlePageSizeChange = (newSize: string) => {
    updateSearchParams({ size: newSize, page: "1" });
  };

  const handleCategoryChange = (category: string) => {
    updateSearchParams({ category, page: "1" });
  };

  const handleSortChange = (sort: string) => {
    updateSearchParams({ sort, page: "1" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ q: searchQuery, page: "1" });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    updateSearchParams({
      minPrice: values[0].toString(),
      maxPrice: values[1].toString(),
      page: "1"
    });
  };

  const updateSearchParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`);
  };

  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  // Get cart item details for each product
  const getCartDetails = (productId: string) => {
    const cartItem = cart?.items?.find(item => item.productId === productId);
    return {
      quantity: cartItem?.quantity || 0,
      isInCart: Boolean(cartItem)
    };
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCart(prev => ({ ...prev, [product._id]: true }));
      setLocalQuantities(prev => ({ ...prev, [product._id]: 1 }));
      
      await addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      });
      
      toast.success("✔ Added to Cart");
    } catch (error) {
      console.error('Error adding to cart:', error);
      setLocalQuantities(prev => ({ ...prev, [product._id]: 0 }));
      toast.error("Failed to add item to cart");
    } finally {
      // Reset after 2 seconds
      setTimeout(() => {
        setAddingToCart(prev => ({ ...prev, [product._id]: false }));
      }, 2000);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setLocalQuantities(prev => ({ ...prev, [productId]: newQuantity }));
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      const { quantity } = getCartDetails(productId);
      setLocalQuantities(prev => ({ ...prev, [productId]: quantity }));
      toast.error("Failed to update quantity");
    }
  };

  // Update local quantities when cart changes
  useEffect(() => {
    const newQuantities: { [key: string]: number } = {};
    cart?.items?.forEach(item => {
      newQuantities[item.productId] = item.quantity;
    });
    setLocalQuantities(newQuantities);
  }, [cart?.items]);

  // Add effect to fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Add effect to extract unique brands
  useEffect(() => {
    if (products.length > 0) {
      const uniqueBrands = Array.from(
        new Set(products.map((product) => product.brand))
      ).filter(Boolean).sort();
      setBrands(uniqueBrands);
    }
  }, [products]);

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    updateSearchParams({ brand, page: "1" });
  };

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Replace toggleWishlist function
  const handleWishlistToggle = async (product: Product) => {
    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0]
      });
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
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-white pt-16 dark:bg-gray-800 dark:border-gray-700">
        <div className="h-full overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          {/* Search */}
          <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Search Products
              </h3>
              <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
              />
                <Button type="submit" size="icon" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Categories */}
          <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Categories
              </h3>
              <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
              <Button
                  variant={selectedCategory === "" ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => handleCategoryChange("")}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category._id}
                    variant={selectedCategory === category._id ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => handleCategoryChange(category._id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            </div>

          {/* Brands */}
          <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Brands
              </h3>
              <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
              <Button
                  variant={!selectedBrand ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => handleBrandChange("")}
              >
                All Brands
              </Button>
              {brands.map((brand) => (
                <Button
                  key={brand}
                    variant={selectedBrand === brand ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => handleBrandChange(brand)}
                >
                  {brand}
                </Button>
              ))}
            </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Price Range
              </h3>
              <div className="space-y-4 px-1">
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  className="mt-6"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">${priceRange[0]}</span>
                  <span className="text-gray-600 dark:text-gray-300">${priceRange[1]}</span>
          </div>
        </div>
      </div>

            {/* Sort */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Sort By
              </h3>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setSelectedCategory("");
                setSelectedBrand("");
                setPriceRange([0, 1000]);
                setSortBy("newest");
                setSearchQuery("");
                updateSearchParams({
                  page: "1",
                  category: "",
                  brand: "",
                  minPrice: "0",
                  maxPrice: "1000",
                  sort: "newest",
                  q: ""
                });
              }}
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="sm:ml-64">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              All Products
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse through our collection of high-quality products.
            </p>
          </div>

          {/* Products Section */}
          <div>
            {/* Products Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalProducts)} to{" "}
                {Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} products
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
            </SelectTrigger>
            <SelectContent>
                    {PAGE_SIZES.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} items
                      </SelectItem>
                    ))}
            </SelectContent>
          </Select>
              </div>
        </div>

        {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="group relative overflow-hidden border-0 bg-white dark:bg-gray-800">
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Discount Badge */}
                    {product.comparePrice && product.comparePrice > product.price && (
                      <Badge className="absolute left-2 top-2 bg-red-500">
                        {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                      </Badge>
                    )}

                    {/* Quick Action Buttons */}
                    <div className="absolute right-2 top-2 flex flex-col gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlistToggle(product);
                        }}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isInWishlist(product._id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                        onClick={() => router.push(`/products/${product._id}`)}
                      >
                        <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Brand & Rating */}
                    <div className="flex items-center justify-between mb-2">
                      {product.brand && (
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {product.brand}
                        </span>
                      )}
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <div className="flex items-center">
                            {renderStars(product.rating)}
                          </div>
                          {product.reviewCount && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({product.reviewCount})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 
                      className="font-medium text-gray-900 dark:text-gray-100 mb-1 cursor-pointer hover:text-primary"
                      onClick={() => router.push(`/products/${product._id}`)}
                    >
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                      {product.description}
                    </p>

                    {/* Price & Cart */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          ${product.price}
                        </span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.comparePrice}
                          </span>
                        )}
                      </div>

                      {getCartDetails(product._id).isInCart ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded-lg bg-gray-50 dark:bg-gray-700">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(
                                product._id,
                                localQuantities[product._id] - 1
                              )}
                              disabled={localQuantities[product._id] <= 1 || cartLoading}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {localQuantities[product._id]}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(
                                product._id,
                                localQuantities[product._id] + 1
                              )}
                              disabled={cartLoading}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                          <Button
                          size="sm"
                          className="gap-2"
                            onClick={() => handleAddToCart(product)}
                            disabled={addingToCart[product._id] || cartLoading}
                          >
                            {addingToCart[product._id] ? (
                              <>
                              <Check className="h-4 w-4" />
                                Added
                              </>
                            ) : (
                              <>
                              <ShoppingCart className="h-4 w-4" />
                                Add
                              </>
                            )}
                          </Button>
                      )}
                    </div>

                    {/* Vendor */}
                    {product.vendor?.name && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Sold by: {product.vendor.name}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalProducts > 0 && (
              <div className="mt-8 mb-8 flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
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
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 