"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ListOrdered,
  Users,
  Settings
} from "lucide-react";

const adminNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ListOrdered
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings
  }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {adminNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent" : "transparent"
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
} 