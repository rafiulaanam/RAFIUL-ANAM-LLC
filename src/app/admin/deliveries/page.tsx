"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Customer {
  name: string;
  email: string;
  address: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: Customer;
  total: number;
  status: "shipped" | "out_for_delivery" | "delivered";
  trackingId?: string;
  createdAt: string;
  items: OrderItem[];
}

interface ApiError extends Error {
  message: string;
}

const DELIVERY_STATUS = {
  shipped: { label: "Shipped", color: "bg-purple-500" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-blue-500" },
  delivered: { label: "Delivered", color: "bg-green-500" },
};

export default function DeliveriesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dialogOrder, setDialogOrder] = useState<Order | null>(null);
  const [trackingId, setTrackingId] = useState("");
  const { toast } = useToast();

  const fetchDeliveries = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/deliveries?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch deliveries");
      
      const result = await response.json();
      if (result.success) {
        setOrders(result.data.orders);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        throw new Error(result.error || "Failed to fetch deliveries");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch deliveries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, searchQuery, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const updateDeliveryStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/deliveries/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update delivery status");
      
      const result = await response.json();
      if (result.success) {
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus as Order["status"] }
            : order
        ));
        toast({
          title: "Success",
          description: "Delivery status updated successfully",
        });
      } else {
        throw new Error(result.error || "Failed to update delivery status");
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive",
      });
    }
  };

  const updateTrackingId = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/deliveries/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingId }),
      });

      if (!response.ok) throw new Error("Failed to update tracking ID");
      
      const result = await response.json();
      if (result.success) {
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, trackingId }
            : order
        ));
        setDialogOrder(null);
        setTrackingId("");
        toast({
          title: "Success",
          description: "Tracking ID updated successfully",
        });
      } else {
        throw new Error(result.error || "Failed to update tracking ID");
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive",
      });
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Deliveries</h1>
        <p className="text-muted-foreground">
          Track and manage order deliveries.
        </p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search deliveries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(DELIVERY_STATUS).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Order ID</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("customer.name")}
                >
                  Customer
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("createdAt")}
                >
                  Ship Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No deliveries found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.trackingId ? (
                      <div className="font-medium">{order.trackingId}</div>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDialogOrder(order)}
                          >
                            Add Tracking ID
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Tracking ID</DialogTitle>
                            <DialogDescription>
                              Enter the tracking ID for order {order.orderNumber}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Input
                                placeholder="Enter tracking ID"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                              />
                            </div>
                            <Button
                              onClick={() => updateTrackingId(order._id)}
                              disabled={!trackingId}
                            >
                              Save Tracking ID
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${DELIVERY_STATUS[order.status].color} text-white`}
                    >
                      {DELIVERY_STATUS[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.entries(DELIVERY_STATUS).map(([status, { label }]) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => updateDeliveryStatus(order._id, status)}
                            disabled={order.status === status}
                          >
                            Mark as {label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={!!dialogOrder} onOpenChange={() => setDialogOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Tracking ID</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="trackingId"
                placeholder="Enter tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOrder(null);
                setTrackingId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => dialogOrder && updateTrackingId(dialogOrder._id)}
              disabled={!trackingId.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 