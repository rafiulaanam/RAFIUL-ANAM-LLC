"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

interface DisputeRequest {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  date: string;
}

const mockDisputes: DisputeRequest[] = [
  {
    id: "DSP001",
    orderId: "ORD123",
    customer: "John Doe",
    amount: 99.99,
    reason: "Item not as described",
    status: "pending",
    date: "2024-03-15",
  },
  {
    id: "DSP002",
    orderId: "ORD124",
    customer: "Jane Smith",
    amount: 149.99,
    reason: "Wrong item received",
    status: "approved",
    date: "2024-03-14",
  },
  {
    id: "DSP003",
    orderId: "ORD125",
    customer: "Mike Johnson",
    amount: 79.99,
    reason: "Defective product",
    status: "rejected",
    date: "2024-03-13",
  },
];

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<DisputeRequest[]>(mockDisputes);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesStatus =
      statusFilter === "all" || dispute.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      dispute.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (disputeId: string, newStatus: "approved" | "rejected") => {
    setDisputes((prevDisputes) =>
      prevDisputes.map((dispute) =>
        dispute.id === disputeId
          ? { ...dispute, status: newStatus }
          : dispute
      )
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Refund Requests</h1>
        <p className="text-gray-500">Manage customer refund requests and disputes</p>
      </div>

      <Card className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by order ID, customer, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDisputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell className="font-medium">{dispute.orderId}</TableCell>
                  <TableCell>{dispute.customer}</TableCell>
                  <TableCell>${dispute.amount.toFixed(2)}</TableCell>
                  <TableCell>{dispute.reason}</TableCell>
                  <TableCell>{new Date(dispute.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(dispute.status)}>
                      {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {dispute.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(dispute.id, "approved")}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(dispute.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
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