"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  MapPin,
  Truck,
  Package,
  Calendar,
  Clock,
  User,
  Building,
  Phone,
} from "lucide-react";

interface DeliveryPartner {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  status: "pending" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "failed";
  trackingNumber: string;
  deliveryPartner: DeliveryPartner;
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    status: string;
    timestamp: string;
    location?: string;
    note?: string;
  }[];
}

const mockDeliveries: Delivery[] = [
  {
    id: "DEL001",
    orderId: "ORD001",
    customerName: "John Doe",
    address: "123 Main St, City, Country",
    status: "in_transit",
    trackingNumber: "TRK123456789",
    deliveryPartner: {
      id: "DP001",
      name: "Express Logistics",
      contactPerson: "Jane Wilson",
      phone: "+1234567890",
      email: "contact@expresslogistics.com",
      address: "456 Carrier St, City, Country",
    },
    estimatedDelivery: "2024-03-18",
    createdAt: "2024-03-15",
    updatedAt: "2024-03-16",
    timeline: [
      {
        status: "pending",
        timestamp: "2024-03-15T10:00:00",
        location: "Warehouse",
        note: "Order ready for pickup",
      },
      {
        status: "picked_up",
        timestamp: "2024-03-15T14:30:00",
        location: "Warehouse",
        note: "Picked up by delivery partner",
      },
      {
        status: "in_transit",
        timestamp: "2024-03-16T09:15:00",
        location: "Regional Hub",
        note: "Package in transit to destination",
      },
    ],
  },
  {
    id: "DEL002",
    orderId: "ORD002",
    customerName: "Jane Smith",
    address: "456 Oak St, City, Country",
    status: "delivered",
    trackingNumber: "TRK987654321",
    deliveryPartner: {
      id: "DP001",
      name: "Express Logistics",
      contactPerson: "Jane Wilson",
      phone: "+1234567890",
      email: "contact@expresslogistics.com",
      address: "456 Carrier St, City, Country",
    },
    estimatedDelivery: "2024-03-15",
    createdAt: "2024-03-14",
    updatedAt: "2024-03-15",
    timeline: [
      {
        status: "pending",
        timestamp: "2024-03-14T11:00:00",
        location: "Warehouse",
        note: "Order ready for pickup",
      },
      {
        status: "picked_up",
        timestamp: "2024-03-14T15:30:00",
        location: "Warehouse",
        note: "Picked up by delivery partner",
      },
      {
        status: "in_transit",
        timestamp: "2024-03-15T09:00:00",
        location: "Regional Hub",
        note: "Package in transit to destination",
      },
      {
        status: "out_for_delivery",
        timestamp: "2024-03-15T11:30:00",
        location: "Local Hub",
        note: "Out for delivery",
      },
      {
        status: "delivered",
        timestamp: "2024-03-15T14:45:00",
        location: "Destination",
        note: "Package delivered successfully",
      },
    ],
  },
];

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      searchQuery === "" ||
      delivery.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: Delivery["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "picked_up":
        return "bg-blue-100 text-blue-800";
      case "in_transit":
        return "bg-purple-100 text-purple-800";
      case "out_for_delivery":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Delivery Status</h1>
        <p className="text-gray-500">Track and manage your deliveries</p>
      </div>

      <Card className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by order ID, tracking number, or customer name..."
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
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tracking Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery Partner</TableHead>
                <TableHead>Est. Delivery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.orderId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{delivery.customerName}</p>
                      <p className="text-sm text-gray-500">{delivery.address}</p>
                    </div>
                  </TableCell>
                  <TableCell>{delivery.trackingNumber}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(delivery.status)}>
                      {delivery.status.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{delivery.deliveryPartner.name}</TableCell>
                  <TableCell>{formatDate(delivery.estimatedDelivery)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Delivery Details - {delivery.orderId}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6">
                          {/* Delivery Info */}
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Card className="p-4">
                              <h3 className="mb-3 font-semibold">Customer Details</h3>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span>{delivery.customerName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>{delivery.address}</span>
                                </div>
                              </div>
                            </Card>
                            <Card className="p-4">
                              <h3 className="mb-3 font-semibold">Delivery Partner</h3>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4 text-gray-400" />
                                  <span>{delivery.deliveryPartner.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span>{delivery.deliveryPartner.contactPerson}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span>{delivery.deliveryPartner.phone}</span>
                                </div>
                              </div>
                            </Card>
                          </div>

                          {/* Tracking Timeline */}
                          <Card className="p-4">
                            <h3 className="mb-4 font-semibold">Tracking Timeline</h3>
                            <div className="space-y-4">
                              {delivery.timeline.map((event, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-4"
                                >
                                  <div
                                    className={`mt-1 rounded-full p-2 ${
                                      getStatusBadgeColor(event.status as Delivery["status"])
                                    }`}
                                  >
                                    <Package className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium">
                                        {event.status.replace(/_/g, " ").toUpperCase()}
                                      </p>
                                      <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="h-4 w-4" />
                                        {formatDateTime(event.timestamp)}
                                      </div>
                                    </div>
                                    {event.location && (
                                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin className="h-4 w-4" />
                                        {event.location}
                                      </div>
                                    )}
                                    {event.note && (
                                      <p className="mt-1 text-sm text-gray-600">
                                        {event.note}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card>
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