"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  Search
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

interface Vendor {
  _id: string;
  name: string;
  email: string;
  image: string | null;
  storeName: string;
  storeDescription: string;
  isVerified: boolean;
  isActive: boolean;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  joinedAt: string;
  lastLogin: string | null;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch("/api/admin/vendors");
      if (!response.ok) throw new Error("Failed to fetch vendors");
      
      const result = await response.json();
      if (result.success) {
        setVendors(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch vendors");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch vendors",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vendor.name.toLowerCase().includes(searchLower) ||
      vendor.email.toLowerCase().includes(searchLower) ||
      vendor.storeName.toLowerCase().includes(searchLower)
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Vendors</h1>
        <p className="text-muted-foreground">
          Manage and monitor vendor accounts.
        </p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          Export Data
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVendors.map((vendor) => (
          <Card key={vendor._id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={vendor.image || ""} />
                    <AvatarFallback>
                      {vendor.name ? getInitials(vendor.name) : "V"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {vendor.storeName || "Unnamed Store"}
                      {vendor.isVerified && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      {vendor.name}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={vendor.isActive ? "default" : "secondary"}
                >
                  {vendor.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {vendor.email}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Products
                    </span>
                    <span className="font-semibold">
                      {vendor.totalProducts}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Orders
                    </span>
                    <span className="font-semibold">
                      {vendor.totalOrders}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Revenue
                  </span>
                  <span className="font-semibold">
                    {formatPrice(vendor.totalRevenue)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined {format(new Date(vendor.joinedAt), "MMM d, yyyy")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No vendors found matching your search.
        </div>
      )}
    </div>
  );
} 