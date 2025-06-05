"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const categories = [
  {
    id: "electronics",
    label: "Electronics",
    description: "Latest gadgets and tech accessories",
    href: "/shop?category=electronics",
  },
  {
    id: "fashion",
    label: "Fashion",
    description: "Trendy clothing and accessories",
    href: "/shop?category=fashion",
  },
  {
    id: "home-living",
    label: "Home & Living",
    description: "Furniture and home decor",
    href: "/shop?category=home-living",
  },
  {
    id: "beauty",
    label: "Beauty",
    description: "Cosmetics and personal care",
    href: "/shop?category=beauty",
  },
  {
    id: "sports",
    label: "Sports & Outdoors",
    description: "Athletic gear and equipment",
    href: "/shop?category=sports",
  },
  {
    id: "books",
    label: "Books",
    description: "Books and stationery",
    href: "/shop?category=books",
  },
];

export function CategoryDropdown() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {categories.map((category) => (
                <ListItem
                  key={category.id}
                  title={category.label}
                  href={category.href}
                >
                  {category.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
  const router = useRouter();

  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          href={href}
          onClick={(e) => {
            e.preventDefault();
            router.push(href || "/");
          }}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem"; 