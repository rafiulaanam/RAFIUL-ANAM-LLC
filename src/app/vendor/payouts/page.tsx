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
  DollarSign,
  Calendar,
  CreditCard,
  Download,
  Bank,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  FileText,
} from "lucide-react";

interface PaymentMethod {
  id: string;
  type: "bank_account" | "paypal";
  name: string;
  details: string;
  isDefault: boolean;
}

interface Payout {
  id: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  method: PaymentMethod;
  createdAt: string;
  completedAt?: string;
  reference: string;
  currency: string;
  fees: number;
}

interface EarningPeriod {
  id: string;
  startDate: string;
  endDate: string;
  totalEarnings: number;
  orderCount: number;
  status: "pending" | "processing" | "paid";
  payout?: Payout;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "PM001",
    type: "bank_account",
    name: "Main Bank Account",
    details: "**** **** **** 1234",
    isDefault: true,
  },
  {
    id: "PM002",
    type: "paypal",
    name: "PayPal Account",
    details: "vendor@example.com",
    isDefault: false,
  },
];

const mockEarningPeriods: EarningPeriod[] = [
  {
    id: "EP001",
    startDate: "2024-03-01",
    endDate: "2024-03-15",
    totalEarnings: 2450.75,
    orderCount: 32,
    status: "paid",
    payout: {
      id: "PO001",
      amount: 2450.75,
      status: "completed",
      method: mockPaymentMethods[0],
      createdAt: "2024-03-16T10:00:00",
      completedAt: "2024-03-17T14:30:00",
      reference: "PAY123456789",
      currency: "USD",
      fees: 24.50,
    },
  },
  {
    id: "EP002",
    startDate: "2024-02-16",
    endDate: "2024-02-29",
    totalEarnings: 1890.25,
    orderCount: 25,
    status: "paid",
    payout: {
      id: "PO002",
      amount: 1890.25,
      status: "completed",
      method: mockPaymentMethods[0],
      createdAt: "2024-03-01T10:00:00",
      completedAt: "2024-03-02T15:45:00",
      reference: "PAY987654321",
      currency: "USD",
      fees: 18.90,
    },
  },
];

export default function PayoutsPage() {
  const [earningPeriods, setEarningPeriods] = useState<EarningPeriod[]>(mockEarningPeriods);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPeriods = earningPeriods.filter((period) => {
    const matchesSearch =
      searchQuery === "" ||
      period.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (period.payout?.reference || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || period.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEarnings = earningPeriods.reduce(
    (sum, period) => sum + period.totalEarnings,
    0
  );

  const pendingPayouts = earningPeriods
    .filter((period) => period.status === "pending")
    .reduce((sum, period) => sum + period.totalEarnings, 0);

  const getStatusBadgeColor = (status: EarningPeriod["status"] | Payout["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
      case "paid":
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Payouts</h1>
        <p className="text-gray-500">Manage your earnings and payment methods</p>
      </div>

      {/* Stats Overview */}
      <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="flex items-center text-green-600">
              <ArrowUpRight className="h-4 w-4" />
              <span className="ml-1">12.5%</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-yellow-100 p-2 text-yellow-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Pending Payouts</p>
            <p className="text-2xl font-bold">{formatCurrency(pendingPayouts)}</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-green-100 p-2 text-green-600">
              <Bank className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(4890.50)}</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Payment Methods</p>
            <p className="text-2xl font-bold">{paymentMethods.length}</p>
          </div>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="mb-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Payment Methods</h2>
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {method.type === "bank_account" ? (
                    <Bank className="h-5 w-5 text-blue-600" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  )}
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-gray-500">{method.details}</p>
                  </div>
                </div>
                {method.isDefault && (
                  <Badge variant="secondary">Default</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Earnings History */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Earnings History</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by ID or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[250px]"
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
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payout Reference</TableHead>
                <TableHead>Completed Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPeriods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{formatDate(period.startDate)}</p>
                      <p className="text-sm text-gray-500">
                        to {formatDate(period.endDate)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{period.orderCount} orders</TableCell>
                  <TableCell>{formatCurrency(period.totalEarnings)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(period.status)}>
                      {period.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {period.payout?.reference || "-"}
                  </TableCell>
                  <TableCell>
                    {period.payout?.completedAt
                      ? formatDate(period.payout.completedAt)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Earnings Period - {formatDate(period.startDate)} to{" "}
                            {formatDate(period.endDate)}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-sm text-gray-500">Total Earnings</p>
                              <p className="text-lg font-bold">
                                {formatCurrency(period.totalEarnings)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Order Count</p>
                              <p className="text-lg font-bold">{period.orderCount}</p>
                            </div>
                          </div>

                          {period.payout && (
                            <>
                              <div className="my-4 border-t pt-4">
                                <h3 className="mb-3 font-semibold">Payout Details</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <p className="text-sm text-gray-500">Reference</p>
                                    <p className="font-medium">
                                      {period.payout.reference}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge
                                      className={getStatusBadgeColor(
                                        period.payout.status
                                      )}
                                    >
                                      {period.payout.status.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Payment Method
                                    </p>
                                    <p className="font-medium">
                                      {period.payout.method.name}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Fees</p>
                                    <p className="font-medium">
                                      {formatCurrency(period.payout.fees)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <Button variant="outline" className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Download Statement
                              </Button>
                            </>
                          )}
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