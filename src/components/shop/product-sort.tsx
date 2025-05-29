"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShop } from "@/contexts/shop-context";

export default function ProductSort() {
  const { sortOption, setSortOption } = useShop();

  return (
    <Select value={sortOption} onValueChange={setSortOption}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="featured">Featured</SelectItem>
        <SelectItem value="price-low">Price: Low to High</SelectItem>
        <SelectItem value="price-high">Price: High to Low</SelectItem>
        <SelectItem value="newest">Newest Arrivals</SelectItem>
        <SelectItem value="rating">Highest Rated</SelectItem>
        <SelectItem value="bestselling">Best Selling</SelectItem>
      </SelectContent>
    </Select>
  );
} 