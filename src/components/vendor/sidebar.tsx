"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  PlusCircle,
  DollarSign,
  Star,
  MessageCircle,
  Truck,
  Wallet,
  AlertTriangle,
  Settings,
  Bell,
  HelpCircle,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Dashboard", href: "/vendor", icon: LayoutDashboard },
  { name: "Products", href: "/vendor/products", icon: Package },
  { name: "Orders", href: "/vendor/orders", icon: ShoppingCart },
  { name: "Add Product", href: "/vendor/products/new", icon: PlusCircle },
  { name: "Earnings", href: "/vendor/earnings", icon: DollarSign },
  { name: "Reviews", href: "/vendor/reviews", icon: Star },
  { name: "Messages", href: "/vendor/messages", icon: MessageCircle, badge: "3" },
  { name: "Delivery Status", href: "/vendor/delivery", icon: Truck },
  { name: "Payouts", href: "/vendor/payouts", icon: Wallet },
  { name: "Disputes", href: "/vendor/disputes", icon: AlertTriangle },
  { name: "Settings", href: "/vendor/settings", icon: Settings },
  { name: "Notifications", href: "/vendor/notifications", icon: Bell, badge: "5" },
  { name: "Help / Support", href: "/vendor/support", icon: HelpCircle },
];

export function VendorSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50 dark:bg-gray-900">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Vendor Dashboard</h2>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium ${
                isActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive
                      ? "text-gray-500 dark:text-gray-200"
                      : "text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-200"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </div>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <div>
            <p className="text-sm font-medium">Vendor Name</p>
            <p className="text-xs text-gray-500">vendor@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
} 