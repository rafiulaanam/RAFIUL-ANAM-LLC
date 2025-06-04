"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const navigation = [
  { name: "Shop", href: "/shop" },
  { name: "Categories", href: "/categories" },
  { name: "Featured", href: "/featured" },
  { name: "New Arrivals", href: "/new-arrivals" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const { cart, loading: cartLoading, loadCart } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Calculate total quantity
  const totalQuantity = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const isActive = (path: string) => pathname === path;

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
              {navigation.map((item) => (
            <Link 
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.name}
            </Link>
              ))}
          </nav>
        </div>

        {/* Mobile Logo */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 -ml-3 text-muted-foreground hover:text-foreground"
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
            <ThemeToggle />
              <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                  <Icons.cart className="h-5 w-5" />
                {!cartLoading && totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center ring-2 ring-background">
                    {totalQuantity > 99 ? "99+" : totalQuantity}
                    </span>
                  )}
                </Button>
              </Link>
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
                className="p-2 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                    isActive(item.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
          </nav>
          </div>
        </div>
      </div>
    </header>
  );
} 