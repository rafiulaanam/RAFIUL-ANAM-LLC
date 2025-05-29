"use client";

import { useState } from "react";
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
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  paymentStatus: "paid" | "pending" | "failed";
  createdAt: string;
}

const mockOrders: Order[] = [
  {
    id: "ORD001",
    customerName: "John Doe",
    email: "john@example.com",
    items: [
      { id: "1", name: "Wireless Headphones", quantity: 1, price: 99.99 },
      { id: "2", name: "Smart Watch", quantity: 1, price: 199.99 },
    ],
    total: 299.98,
    status: "pending",
    shippingAddress: "123 Main St, City, Country",
    paymentStatus: "paid",
    createdAt: "2024-03-15T10:00:00",
  },
  {
    id: "ORD002",
    customerName: "Jane Smith",
    email: "jane@example.com",
    items: [
      { id: "3", name: "Running Shoes", quantity: 1, price: 79.99 },
    ],
    total: 79.99,
    status: "shipped",
    shippingAddress: "456 Oak St, City, Country",
    paymentStatus: "paid",
    createdAt: "2024-03-14T15:30:00",
  },
  {
    id: "ORD003",
    customerName: "Mike Johnson",
    email: "mike@example.com",
    items: [
      { id: "4", name: "Gaming Mouse", quantity: 2, price: 49.99 },
    ],
    total: 99.98,
    status: "delivered",
    shippingAddress: "789 Pine St, City, Country",
    paymentStatus: "paid",
    createdAt: "2024-03-13T09:15:00",
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getStatusBadgeColor = (status: Order["status"]) => {
    switch (status) {
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
    switch (status) {
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
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value: Order["status"]) =>
                        handleStatusChange(order.id, value)
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue>
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
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
                      {order.paymentStatus.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
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
                          <DialogTitle>Order Details - {order.id}</DialogTitle>
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
                                {new Date(order.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <User className="h-4 w-4" />
                                Customer:
                              </div>
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-sm text-gray-500">{order.email}</p>
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="h-4 w-4" />
                              Shipping Address:
                            </div>
                            <p className="font-medium">{order.shippingAddress}</p>
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
                                  {order.items.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>${item.price.toFixed(2)}</TableCell>
                                      <TableCell>
                                        ${(item.quantity * item.price).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-right font-medium">
                                      Total:
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      ${order.total.toFixed(2)}
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
                                  {order.status.toUpperCase()}
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