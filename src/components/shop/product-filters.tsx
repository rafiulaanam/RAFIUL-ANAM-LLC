"use client";

import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useShop } from "@/contexts/shop-context";

const categories = [
  { id: "electronics", label: "Electronics" },
  { id: "fashion", label: "Fashion" },
  { id: "accessories", label: "Accessories" },
  { id: "home-living", label: "Home & Living" },
  { id: "sports", label: "Sports & Outdoors" },
];

const brands = [
  { id: "apple", label: "Apple" },
  { id: "samsung", label: "Samsung" },
  { id: "sony", label: "Sony" },
  { id: "nike", label: "Nike" },
  { id: "adidas", label: "Adidas" },
];

const ratings = [
  { id: "4-up", label: "4 Stars & Up" },
  { id: "3-up", label: "3 Stars & Up" },
  { id: "2-up", label: "2 Stars & Up" },
  { id: "1-up", label: "1 Star & Up" },
];

export default function ProductFilters() {
  const {
    priceRange,
    setPriceRange,
    selectedCategories,
    toggleCategory,
    selectedBrands,
    toggleBrand,
    selectedRating,
    setSelectedRating,
  } = useShop();

  return (
    <div className="space-y-4">
      <div className="font-semibold text-lg mb-6">Filters</div>
      
      <Accordion type="single" collapsible className="w-full">
        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 px-1">
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                max={1000}
                step={1}
                className="mb-6"
              />
              <div className="flex items-center justify-between text-sm">
                <div>${priceRange[0]}</div>
                <div>${priceRange[1]}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Categories */}
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <label
                    htmlFor={category.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brands */}
        <AccordionItem value="brands">
          <AccordionTrigger>Brands</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={brand.id}
                    checked={selectedBrands.includes(brand.id)}
                    onCheckedChange={() => toggleBrand(brand.id)}
                  />
                  <label
                    htmlFor={brand.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {brand.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Ratings */}
        <AccordionItem value="ratings">
          <AccordionTrigger>Ratings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={rating.id}
                    checked={selectedRating === rating.id}
                    onCheckedChange={() => setSelectedRating(selectedRating === rating.id ? null : rating.id)}
                  />
                  <label
                    htmlFor={rating.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {rating.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
} 