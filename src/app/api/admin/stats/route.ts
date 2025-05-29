import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session || !isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    // Get counts
    const [
      totalProducts,
      totalUsers,
      totalVendors,
      totalOrders,
      topProducts,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Vendor.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Product.aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "products.product",
            as: "orders"
          }
        },
        {
          $project: {
            name: 1,
            sales: { $size: "$orders" }
          }
        },
        { $sort: { sales: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Calculate revenue statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [currentRevenue, previousRevenue] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: currentMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: previousMonth,
              $lt: currentMonth
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" }
          }
        }
      ])
    ]);

    const currentTotal = currentRevenue[0]?.total || 0;
    const previousTotal = previousRevenue[0]?.total || 0;
    const revenueChange = previousTotal === 0 
      ? 100 
      : ((currentTotal - previousTotal) / previousTotal) * 100;

    return NextResponse.json({
      totalProducts,
      totalUsers,
      totalVendors,
      totalOrders,
      topProducts,
      revenue: {
        total: currentTotal,
        change: Math.round(revenueChange * 100) / 100
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 