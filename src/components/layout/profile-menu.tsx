"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import NextLink from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { Icons } from "@/components/ui/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof NextLink>
>(({ href, children, ...props }, ref) => {
  return (
    <NextLink href={href || "/"} {...props} ref={ref}>
      {children}
    </NextLink>
  );
});
Link.displayName = "Link";

export function ProfileMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link href="/register">
          <Button>Sign up</Button>
        </Link>
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    { href: "/profile", icon: "user", label: "My Profile" },
    { href: "/orders", icon: "cart", label: "My Orders" },
    { href: "/wishlist", icon: "heart", label: "Wishlist" },
    { href: "/addresses", icon: "mapPin", label: "My Addresses" },
  ];

  const adminItems = [
    { href: "/admin", icon: "user", label: "Admin Dashboard" },
    { href: "/admin/products", icon: "cart", label: "Manage Products" },
    { href: "/admin/users", icon: "user", label: "Manage Users" },
  ];

  const vendorItems = [
    { href: "/vendor", icon: "user", label: "Vendor Dashboard" },
    { href: "/vendor/products", icon: "cart", label: "My Products" },
    { href: "/vendor/sales", icon: "cart", label: "Sales Report" },
  ];

  const settingsItems = [
    { href: "/settings", icon: "settings", label: "Settings" },
    { href: "/help", icon: "help", label: "Help Center" },
  ];

  const roleItems = session.user.role === "ADMIN" 
    ? adminItems 
    : session.user.role === "VENDOR" 
    ? vendorItems 
    : [];

  const MenuItem = React.forwardRef<
    HTMLAnchorElement,
    {
      href: string;
      icon: keyof typeof Icons;
      label: string;
    }
  >(({ href, icon, label }, ref) => (
    <Link
      ref={ref}
      href={href}
      className="flex items-center px-3 py-2 text-sm hover:bg-accent rounded-sm"
      onClick={() => setIsOpen(false)}
    >
      {React.createElement(Icons[icon], {
        className: "mr-2 h-4 w-4"
      })}
      <span>{label}</span>
    </Link>
  ));
  MenuItem.displayName = "MenuItem";

  const MenuGroup = ({ items }: { items: Array<{ href: string; icon: keyof typeof Icons; label: string }> }) => (
    <div className="px-1 py-1">
      {items.map((item) => (
        <MenuItem key={item.href} {...item} />
      ))}
    </div>
  );

  const Divider = () => <div className="my-1 h-px bg-border" />;

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={session.user.image || ""} 
            alt={session.user.name || "User"} 
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(session.user.name)}
          </AvatarFallback>
        </Avatar>
      </Button>

      {isOpen && (
        <div className={cn(
          "absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md border bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
          "animate-in fade-in-0 zoom-in-95",
        )}>
          <div className="px-3 py-2 text-sm">
            <p className="font-medium truncate">{session.user.name}</p>
            <p className="text-muted-foreground truncate text-xs">{session.user.email}</p>
          </div>
          
          <Divider />
          <MenuGroup items={menuItems} />

          {roleItems.length > 0 && (
            <>
              <Divider />
              <MenuGroup items={roleItems} />
            </>
          )}

          <Divider />
          <MenuGroup items={settingsItems} />

          <Divider />
          <div className="px-1 py-1">
            <LogoutButton
              variant="ghost"
              className="w-full flex items-center px-3 py-2 text-sm hover:bg-accent rounded-sm"
              onClick={() => setIsOpen(false)}
            >
              <Icons.logout className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </LogoutButton>
          </div>
        </div>
      )}
    </div>
  );
} 