"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileMenu } from "@/components/layout/profile-menu";

export default function Navbar() {
  const { data: session } = useSession();
  const { cart, isLoading, itemCount } = useShoppingCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Icons.menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link href="/shop" className="text-lg">Shop</Link>
              <Link href="/categories" className="text-lg">Categories</Link>
              <Link href="/deals" className="text-lg">Deals</Link>
              <Link href="/about" className="text-lg">About</Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Logo & Nav */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              E-commerce
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link 
              href="/shop" 
              className="transition-colors hover:text-primary"
            >
              Shop
            </Link>
            <Link 
              href="/categories"
              className="transition-colors hover:text-primary"
            >
              Categories
            </Link>
            <Link 
              href="/deals"
              className="transition-colors hover:text-primary"
            >
              Deals
            </Link>
            <Link 
              href="/about"
              className="transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Mobile Logo */}
        <div className="md:hidden flex-1 flex justify-center">
          <Link href="/" className="font-bold text-lg">
            My E-commerce
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            {session?.user && (
              <Link href="/cart">
                <Button variant="ghost" className="relative">
                  <Icons.cart className="h-5 w-5" />
                  {!isLoading && itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            <ProfileMenu />
          </nav>
        </div>
      </div>
    </header>
  );
} 