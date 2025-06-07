"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Store,
  Package,
  ShoppingBag,
  Settings,
  BarChart2,
  LogOut,
  PlusCircle,
  DollarSign,
  Star,
  MessageSquare,
  Truck,
  Wallet,
  AlertCircle,
  Bell,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

const menuGroups = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/vendor",
        icon: BarChart2,
        description: "Overview of sales, orders, and stats"
      },
      {
        title: "Add Product",
        href: "/vendor/products/new",
        icon: PlusCircle,
        description: "Create a new product listing"
      },
    ]
  },
  {
    title: "Products & Orders",
    items: [
      {
        title: "Products",
        href: "/vendor/products",
        icon: Package,
        description: "Manage your product listings"
      },
      {
        title: "Orders",
        href: "/vendor/orders",
        icon: ShoppingBag,
        description: "View and manage orders"
      },
      {
        title: "Delivery Status",
        href: "/vendor/delivery",
        icon: Truck,
        description: "Update delivery tracking"
      },
    ]
  },
  {
    title: "Finance",
    items: [
      {
        title: "Earnings",
        href: "/vendor/earnings",
        icon: DollarSign,
        description: "View earnings and commissions"
      },
      {
        title: "Payouts",
        href: "/vendor/payouts",
        icon: Wallet,
        description: "Track payments and payouts"
      },
    ]
  },
  {
    title: "Customer Interaction",
    items: [
      {
        title: "Reviews",
        href: "/vendor/reviews",
        icon: Star,
        description: "Manage customer reviews"
      },
      {
        title: "Messages",
        href: "/vendor/messages",
        icon: MessageSquare,
        description: "Customer and admin messages"
      },
      {
        title: "Disputes",
        href: "/vendor/disputes",
        icon: AlertCircle,
        description: "Handle customer disputes"
      },
    ]
  },
  {
    title: "Support & Settings",
    items: [
      {
        title: "Notifications",
        href: "/vendor/notifications",
        icon: Bell,
        description: "View all notifications"
      },
      {
        title: "Store Settings",
        href: "/vendor/settings",
        icon: Settings,
        description: "Manage store preferences"
      },
      {
        title: "Help & Support",
        href: "/vendor/support",
        icon: HelpCircle,
        description: "Get help and support"
      },
    ]
  },
];

export default function VendorSidebar() {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(menuGroups.map(g => g.title));

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(current =>
      current.includes(groupTitle)
        ? current.filter(title => title !== groupTitle)
        : [...current, groupTitle]
    );
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r h-full flex flex-col">
      <div className="p-6 border-b">
        <Link href="/vendor" className="flex items-center gap-2 font-semibold text-lg">
          <Store className="h-6 w-6" />
          <span>Vendor Portal</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {menuGroups.map((group) => (
          <div key={group.title} className="px-3 mb-4">
            <button
              onClick={() => toggleGroup(group.title)}
              className="flex items-center justify-between w-full px-2 py-1 text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              <span>{group.title}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expandedGroups.includes(group.title) ? "transform rotate-180" : ""
                )}
              />
            </button>
            {expandedGroups.includes(group.title) && (
              <nav className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
} 