"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useShop } from "@/contexts/shop-context";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState } from "react";

export default function SearchInput() {
  const { setSearchQuery } = useShop();
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    setSearchQuery(debouncedValue);
  }, [debouncedValue, setSearchQuery]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Search products..."
        className="pl-10"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
} 