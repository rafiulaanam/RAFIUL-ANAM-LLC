"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  MapPin,
  Package,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    notes?: string;
  };
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
  paidAt?: string;
  updatedAt?: string;
}

// Add helper functions for text formatting
const capitalizeFirstLetter = (str: string | undefined) => {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : 'N/A';
};

const formatStatus = (status: string | undefined) => {
  return status ? status.toUpperCase() : 'N/A';
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle authentication and role check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "VENDOR") {
      router.push("/"); // Redirect non-vendors to home
    }
  }, [status, session, router]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/vendor/orders");
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error(error instanceof Error ? error.message : "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && session.user.role === "VENDOR") {
      fetchOrders();
    }
  }, [session]);

  // Handle loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle unauthorized access
  if (status === "unauthenticated" || session?.user?.role !== "VENDOR") {
    return null; // Return null since useEffect will handle the redirect
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/vendor/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      // Update local state with the returned updated order
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...data } : order
        )
      );

      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update order status");
    }
  };

  const getStatusBadgeColor = (status: Order["status"]) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusBadgeColor = (status: Order["paymentStatus"]) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-gray-500">Manage and track your orders</p>
      </div>

      <Card className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by order ID or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order._id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.shippingInfo?.fullName || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{order.shippingInfo?.email || 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell>{order.items?.length || 0} items</TableCell>
                  <TableCell>${(order.total || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status || "pending"}
                      onValueChange={(value: Order["status"]) =>
                        updateOrderStatus(order._id, value)
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue>
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {capitalizeFirstLetter(order.status)}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPaymentStatusBadgeColor(order.paymentStatus)}>
                      {formatStatus(order.paymentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Order Details - {order._id}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6">
                          {/* Order Info */}
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                Order Date:
                              </div>
                              <p className="font-medium">
                                {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <User className="h-4 w-4" />
                                Customer:
                              </div>
                              <p className="font-medium">{order.shippingInfo?.fullName || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{order.shippingInfo?.email || 'N/A'}</p>
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="h-4 w-4" />
                              Shipping Address:
                            </div>
                            <p className="font-medium">
                              {order.shippingInfo ? 
                                `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state}, ${order.shippingInfo.zipCode}, ${order.shippingInfo.country}` 
                                : 'N/A'}
                            </p>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Package className="h-4 w-4" />
                              Items:
                            </div>
                            <div className="rounded-lg border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.items?.map((item) => (
                                    <TableRow key={item.productId}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>${(item.price || 0).toFixed(2)}</TableCell>
                                      <TableCell>
                                        ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-right font-medium">
                                      Total:
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      ${(order.total || 0).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>

                          {/* Order Timeline */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              Order Timeline:
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <Badge className={getStatusBadgeColor(order.status)}>
                                  {formatStatus(order.status)}
                                </Badge>
                                <p className="text-sm text-gray-500">
                                  Current Status
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
} 