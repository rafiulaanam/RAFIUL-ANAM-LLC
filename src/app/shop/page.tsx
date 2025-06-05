"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Loader2, Search, Star, ShoppingCart, Check, Plus, Minus, Heart, SlidersHorizontal, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { motion } from "framer-motion";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  isNew: boolean;
  isBestSeller: boolean;
}

interface Category {
  _id: string;
  name: string;
  count: number;
}

interface FilterState {
  search: string;
  category: string[];
  minPrice: number;
  maxPrice: number;
  brand: string[];
  sort: string;
  page: number;
  size: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" }
];

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  const [localQuantities, setLocalQuantities] = useState<{ [key: string]: number }>({});
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { cart, addItem, updateQuantity, loading: cartLoading } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, loadWishlist, isInWishlist } = useWishlistStore();

  // Update filters and trigger fetch
  const updateFilters = (updates: Partial<FilterState>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update the params based on the changes
    Object.entries(updates).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle array values (categories, brands)
        if (value.length > 0) {
          params.set(key, value.join(','));
        } else {
          params.delete(key);
        }
      } else if (value !== undefined && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    
    // Update the URL with new params
    router.push(`?${params.toString()}`);
  };

  // Handle price range change
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    // Debounce the API call to prevent too many requests
    const timeoutId = setTimeout(() => {
      updateFilters({
        minPrice: values[0],
        maxPrice: values[1]
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter(id => id !== categoryId);
    
    setSelectedCategories(newCategories);
    updateFilters({ category: newCategories });
  };

  // Handle brand change
  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...selectedBrands, brand]
      : selectedBrands.filter(b => b !== brand);
    
    setSelectedBrands(newBrands);
    updateFilters({ brand: newBrands });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateFilters({ sort: value });
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSortBy("newest");
    setSearchQuery("");
    
    updateFilters({
      category: [],
      brand: [],
      minPrice: 0,
      maxPrice: 1000,
      sort: "newest",
      search: ""
    });
  };

  // Initialize filters from URL params
  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    const size = Number(searchParams.get("size")) || 12;
    const categories = searchParams.get("category")?.split(',') || [];
    const brands = searchParams.get("brand")?.split(',') || [];
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("q") || "";
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || 1000;

    setSelectedCategories(categories);
    setSelectedBrands(brands);
    setSortBy(sort);
    setSearchQuery(search);
    setPriceRange([minPrice, maxPrice]);

    // Fetch products with current filters
    fetchProducts(
      page,
      size,
      categories.join(','),
      sort,
      search,
      minPrice,
      maxPrice
    );
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
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
        ...(sort && { sort }),
        ...(search && { q: search }),
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
      });

      console.log('Fetching products with params:', queryParams.toString());
      const response = await fetch(`/api/products?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch products');
      }
      
      const data = await response.json();
      console.log('Received products:', data);
      
      if (!data.products || !Array.isArray(data.products)) {
        console.error('Invalid products data received:', data);
        throw new Error('Invalid products data received from server');
      }

      setProducts(data.products);
      setTotalProducts(data.total);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load products");
      setIsLoading(false);
      setProducts([]);
      setTotalProducts(0);
    }
  };

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

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const FilterSection = () => (
    <div className="space-y-8">
      {/* Search */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Search</h3>
        <form onSubmit={handleSearch} className="relative">
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        </form>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Price Range</h3>
        <Slider
          defaultValue={priceRange}
          max={1000}
          step={1}
          value={priceRange}
          onValueChange={handlePriceRangeChange}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category._id} className="flex items-center">
              <Checkbox
                id={category._id}
                checked={selectedCategories.includes(category._id)}
                onCheckedChange={(checked) => 
                  handleCategoryChange(category._id, checked as boolean)
                }
              />
              <label
                htmlFor={category._id}
                className="ml-2 text-sm font-medium flex-1 cursor-pointer"
              >
                {category.name}
              </label>
              <span className="text-sm text-muted-foreground">
                ({category.count})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Brands</h3>
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => 
                  handleBrandChange(brand, checked as boolean)
                }
              />
              <label
                htmlFor={brand}
                className="ml-2 text-sm font-medium flex-1 cursor-pointer"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={handleClearFilters}
      >
        Clear All Filters
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <FilterSection />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[300px] bg-white p-6 rounded-xl shadow-sm sticky top-24 h-fit">
            <FilterSection />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort and Results Info */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <p className="text-muted-foreground">
                Showing <span className="font-medium text-foreground">{totalProducts}</span> results
              </p>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  className="group h-full"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.isNew && (
                          <Badge className="bg-primary hover:bg-primary">
                            New Arrival
                          </Badge>
                        )}
                        {product.isBestSeller && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-500">
                            Best Seller
                          </Badge>
                        )}
                      </div>
                      {/* Quick Actions */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlistToggle(product);
                          }}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isInWishlist(product._id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-600"
                            }`}
                          />
                        </Button>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="flex flex-col flex-grow p-4">
                      {/* Brand & Rating */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {product.brand}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({product.reviewCount})
                          </span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Price & Add to Cart */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.comparePrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.comparePrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {getCartDetails(product._id).isInCart ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-lg bg-gray-50">
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
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              {products.length < totalProducts && (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    const currentPage = Number(searchParams.get("page")) || 1;
                    updateFilters({ page: currentPage + 1 });
                  }}
                >
                  Load More Products
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 