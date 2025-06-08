"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Tags,
  Settings,
  Store,
  Truck,
  FileText,
  AlertTriangle,
  BarChart,
  CreditCard,
  Truck as ShippingIcon,
  Sliders,
  ClipboardList,
  BookOpen,
  MessageSquare,
  FolderTree,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Users", href: "/admin/users", icon: Users },
  { 
    name: "Vendors", 
    href: "/admin/vendors", 
    icon: Store,
    children: [
      { name: "All Vendors", href: "/admin/vendors", icon: Store },
      { name: "Vendor Requests", href: "/admin/vendors/requests", icon: ClipboardList },
    ],
  },
  { 
    name: "Blog", 
    href: "/admin/blog", 
    icon: BookOpen,
    children: [
      { name: "All Posts", href: "/admin/blog/posts", icon: BookOpen },
      { name: "Categories", href: "/admin/blog/categories", icon: FolderTree },
      { name: "Comments", href: "/admin/blog/comments", icon: MessageSquare },
    ],
  },
  { name: "Orders", href: "/admin/orders", icon: Package },
  { name: "Deliveries", href: "/admin/deliveries", icon: Truck },
  { name: "Invoices", href: "/admin/invoices", icon: FileText },
  { name: "Disputes", href: "/admin/disputes", icon: AlertTriangle },
  { name: "Reports", href: "/admin/reports", icon: BarChart },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { name: "General", href: "/admin/settings", icon: Sliders },
      { name: "Shipping", href: "/admin/settings/shipping", icon: ShippingIcon },
      { name: "Payment Methods", href: "/admin/settings/payment", icon: CreditCard },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50 dark:bg-gray-900">
      <div className="flex-shrink-0 p-4 border-b">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? "text-gray-500 dark:text-gray-200"
                        : "text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-200"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
                {hasChildren && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                            isChildActive
                              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                          }`}
                        >
                          <child.icon
                            className={`mr-3 h-4 w-4 flex-shrink-0 ${
                              isChildActive
                                ? "text-gray-500 dark:text-gray-200"
                                : "text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-200"
                            }`}
                            aria-hidden="true"
                          />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
} 