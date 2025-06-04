"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Store,
  MoreVertical,
  Ban,
  CheckCircle,
  AlertCircle,
  Package,
  ShoppingCart,
  Calendar,
  DollarSign,
} from "lucide-react";

interface Vendor {
  _id: string;
  name: string;
  email: string;
  image?: string;
  storeName: string;
  storeDescription: string;
  isVerified: boolean;
  isActive: boolean;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  joinedAt: string;
  lastLogin?: string;
}

export default function VendorsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    } else {
    fetchVendors();
    }
  }, [session, router]);

  async function fetchVendors() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/vendors");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch vendors");
      }

      setVendors(data.data);
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to fetch vendors",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleVendorStatusUpdate(vendorId: string, isActive: boolean) {
    try {
      setProcessingId(vendorId);
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update vendor status");
      }

      toast.success("Success", {
        description: `Vendor ${isActive ? "activated" : "deactivated"} successfully`,
      });

      // Update the vendor in the list
      setVendors(vendors.map(vendor => 
        vendor._id === vendorId ? { ...vendor, isActive } : vendor
      ));
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to update vendor status",
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleVerificationUpdate(vendorId: string, isVerified: boolean) {
    try {
      setProcessingId(vendorId);
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update verification status");
      }

      toast.success("Success", {
        description: `Vendor ${isVerified ? "verified" : "unverified"} successfully`,
      });

      // Update the vendor in the list
      setVendors(vendors.map(vendor => 
        vendor._id === vendorId ? { ...vendor, isVerified } : vendor
      ));
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to update verification status",
      });
    } finally {
      setProcessingId(null);
    }
  }

  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.storeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Vendors</CardTitle>
              <CardDescription>
                Manage and monitor vendor accounts
              </CardDescription>
      </div>
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
          />
        </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
        {filteredVendors.map((vendor) => (
                  <TableRow key={vendor._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={vendor.image} />
                          <AvatarFallback>{getInitials(vendor.name)}</AvatarFallback>
                  </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{vendor.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {vendor.email}
                          </span>
                  </div>
                </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{vendor.storeName}</span>
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {vendor.storeDescription}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={vendor.isActive ? "default" : "secondary"}>
                  {vendor.isActive ? "Active" : "Inactive"}
                </Badge>
                        <Badge variant={vendor.isVerified ? "success" : "warning"}>
                          {vendor.isVerified ? "Verified" : "Unverified"}
                        </Badge>
              </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {vendor.totalProducts}
                  </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      {vendor.totalOrders}
                  </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                        {formatCurrency(vendor.totalRevenue)}
                </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                        {new Date(vendor.joinedAt).toLocaleDateString()}
                </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            disabled={processingId === vendor._id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleVendorStatusUpdate(vendor._id, !vendor.isActive)}
                          >
                            {vendor.isActive ? (
                              <Ban className="mr-2 h-4 w-4" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {vendor.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleVerificationUpdate(vendor._id, !vendor.isVerified)}
                          >
                            {vendor.isVerified ? (
                              <AlertCircle className="mr-2 h-4 w-4" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {vendor.isVerified ? "Remove Verification" : "Verify"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/vendors/${vendor._id}`)}
                          >
                            <Store className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>
            </CardContent>
          </Card>
    </div>
  );
} 