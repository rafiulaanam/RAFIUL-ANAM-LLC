import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { getServerSession } from "next-auth";
import { isAdmin, authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get MongoDB client
    const client = await clientPromise;
    const db = client.db();

    // Get counts
    const [
      totalProducts,
      totalUsers,
      totalVendors,
      totalOrders,
      topProducts,
    ] = await Promise.all([
      db.collection("products").countDocuments({ isActive: true }),
      db.collection("users").countDocuments({ isActive: true }),
      db.collection("vendors").countDocuments({ isActive: true }),
      db.collection("orders").countDocuments(),
      db.collection("products").aggregate([
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
      ]).toArray()
    ]);

    // Calculate revenue statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [currentRevenue, previousRevenue] = await Promise.all([
      db.collection("orders").aggregate([
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
      ]).toArray(),
      db.collection("orders").aggregate([
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
      ]).toArray()
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