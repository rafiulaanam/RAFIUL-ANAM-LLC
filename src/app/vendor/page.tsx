"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const salesData = [
  { date: "Mon", sales: 4000 },
  { date: "Tue", sales: 3000 },
  { date: "Wed", sales: 5000 },
  { date: "Thu", sales: 2780 },
  { date: "Fri", sales: 1890 },
  { date: "Sat", sales: 2390 },
  { date: "Sun", sales: 3490 },
];

const topProducts = [
  { name: "Product A", sales: 400 },
  { name: "Product B", sales: 300 },
  { name: "Product C", sales: 200 },
  { name: "Product D", sales: 150 },
  { name: "Product E", sales: 100 },
];

const stats = [
  {
    name: "Total Sales",
    value: "$12,345",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    name: "Total Orders",
    value: "156",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    name: "Products",
    value: "48",
    change: "-2.4%",
    trend: "down",
    icon: Package,
  },
  {
    name: "Avg Rating",
    value: "4.8",
    change: "+0.3",
    trend: "up",
    icon: Star,
  },
];

export default function VendorDashboard() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, Vendor!</h1>
        <p className="text-gray-500">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-gray-400" />
              {stat.trend === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">{stat.name}</p>
              <p className="mt-2 text-3xl font-medium">{stat.value}</p>
              <p
                className={`mt-2 text-sm ${
                  stat.trend === "up" ? "text-green-500" : "text-red-500"
                }`}
              >
                {stat.change} from last week
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Sales Overview</h2>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Top Products</h2>
              <p className="text-sm text-gray-500">Best selling items</p>
            </div>
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="text-sm text-gray-500">Latest updates from your store</p>
        </div>
        <div className="space-y-4">
          {[
            {
              title: "New order received",
              description: "Order #1234 for $129.00",
              time: "5 minutes ago",
            },
            {
              title: "Product stock low",
              description: "Product A is running low on stock",
              time: "2 hours ago",
            },
            {
              title: "New review",
              description: "5-star review for Product B",
              time: "4 hours ago",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </div>
              <p className="text-sm text-gray-400">{activity.time}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 