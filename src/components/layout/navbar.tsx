"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { useState } from "react";
import { X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const { cart, isLoading, itemCount } = useShoppingCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Desktop Logo & Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <Icons.logo className="h-6 w-6" />
              <span className="font-bold">E-commerce</span>
            </Link>
            <nav className="flex items-center space-x-4 lg:space-x-6">
              <Link href="/shop" className="text-sm font-medium transition-colors hover:text-primary">
                Shop
              </Link>
              <Link href="/categories" className="text-sm font-medium transition-colors hover:text-primary">
                Categories
              </Link>
              <Link href="/deals" className="text-sm font-medium transition-colors hover:text-primary">
                Deals
              </Link>
              <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
                About
              </Link>
            </nav>
          </div>

          {/* Mobile Logo */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 -ml-3 text-muted-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Icons.menu className="h-6 w-6" />
            </button>
            <Link href="/" className="ml-2 font-bold text-lg">
              E-commerce
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Icons.cart className="h-5 w-5" />
              {!isLoading && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
            <ProfileMenu />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden fixed inset-0 z-50 bg-background transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-200 ease-in-out`}
        >
          <div className="flex flex-col h-full p-4">
            <div className="flex justify-between items-center mb-8">
              <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <Icons.logo className="h-6 w-6" />
                <span className="font-bold">E-commerce</span>
              </Link>
              <button
                className="p-2 text-muted-foreground"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-4">
              <Link
                href="/shop"
                className="text-lg font-medium transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/categories"
                className="text-lg font-medium transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/deals"
                className="text-lg font-medium transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Deals
              </Link>
              <Link
                href="/about"
                className="text-lg font-medium transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
} 