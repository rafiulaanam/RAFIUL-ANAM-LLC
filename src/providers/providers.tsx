"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/providers/theme-provider";
import { CartProvider } from "react-use-cart";
import { ShopProvider } from "@/contexts/shop-context";
import { Toaster } from "@/components/ui/toaster";

interface ProvidersProps {
  children: ReactNode;
  session?: any;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ShopProvider>
          <CartProvider
            id="my-ecommerce-cart"
            onItemAdd={(item) => console.log(`Item ${item.name} added to cart`)}
            onItemRemove={(item) => console.log(`Item ${item.name} removed from cart`)}
            onItemUpdate={(item) => console.log(`Item ${item.name} updated in cart`)}
          >
            {children}
            <Toaster />
          </CartProvider>
        </ShopProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 