"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Wallet,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
}

interface Transaction {
  id: string;
  date: string;
  type: "sale" | "payout" | "refund";
  amount: number;
  status: "completed" | "pending" | "failed";
  orderId?: string;
}

const mockDailyRevenue = [
  { date: "2024-03-10", revenue: 1250 },
  { date: "2024-03-11", revenue: 1800 },
  { date: "2024-03-12", revenue: 1400 },
  { date: "2024-03-13", revenue: 2100 },
  { date: "2024-03-14", revenue: 1900 },
  { date: "2024-03-15", revenue: 2400 },
  { date: "2024-03-16", revenue: 2200 },
];

const mockCategoryRevenue = [
  { category: "Electronics", revenue: 12500 },
  { category: "Clothing", revenue: 8900 },
  { category: "Sports", revenue: 6700 },
  { category: "Home", revenue: 4500 },
  { category: "Books", revenue: 3200 },
];

const mockTransactions: Transaction[] = [
  {
    id: "TRX001",
    date: "2024-03-16",
    type: "sale",
    amount: 299.98,
    status: "completed",
    orderId: "ORD001",
  },
  {
    id: "TRX002",
    date: "2024-03-15",
    type: "payout",
    amount: 1500.00,
    status: "completed",
  },
  {
    id: "TRX003",
    date: "2024-03-15",
    type: "refund",
    amount: 79.99,
    status: "completed",
    orderId: "ORD002",
  },
];

export default function EarningsPage() {
  const [timeRange, setTimeRange] = useState("7days");

  const stats: StatCard[] = [
    {
      title: "Total Revenue",
      value: "$13,450",
      trend: 12.5,
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: "Total Orders",
      value: "145",
      trend: 8.2,
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      title: "Available Balance",
      value: "$4,890",
      trend: 0,
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      title: "Pending Payouts",
      value: "$2,150",
      trend: -5.1,
      icon: <CreditCard className="h-5 w-5" />,
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getTransactionColor = (type: Transaction["type"]) => {
    switch (type) {
      case "sale":
        return "text-green-600";
      case "payout":
        return "text-blue-600";
      case "refund":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-gray-500">Track your revenue and financial metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-gray-100 p-2">{stat.icon}</div>
              {stat.trend !== 0 && (
                <div
                  className={`flex items-center ${
                    stat.trend > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend > 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="ml-1">{Math.abs(stat.trend)}%</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Revenue Trend</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockDailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`$${value}`, "Revenue"]}
                  labelFormatter={formatDate}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Revenue */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Revenue by Category</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCategoryRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`$${value}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Transactions</h2>
        <div className="space-y-4">
          {mockTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`rounded-full p-2 ${
                    transaction.type === "sale"
                      ? "bg-green-100"
                      : transaction.type === "payout"
                      ? "bg-blue-100"
                      : "bg-red-100"
                  }`}
                >
                  {transaction.type === "sale" ? (
                    <ShoppingCart className={`h-4 w-4 ${getTransactionColor(transaction.type)}`} />
                  ) : transaction.type === "payout" ? (
                    <Wallet className={`h-4 w-4 ${getTransactionColor(transaction.type)}`} />
                  ) : (
                    <CreditCard className={`h-4 w-4 ${getTransactionColor(transaction.type)}`} />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    {transaction.orderId && ` - Order #${transaction.orderId}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === "sale" ? "+" : "-"}${transaction.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 