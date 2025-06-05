"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import Link from "next/link";

interface VendorRequest {
  status: 'pending' | 'approved' | 'rejected';
  // Add other fields if needed
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [vendorRequest, setVendorRequest] = useState<VendorRequest | null>(null);

  useEffect(() => {
    // Fetch vendor request status if user is logged in
    if (session?.user) {
      fetchVendorRequestStatus();
    }
  }, [session]);

  async function fetchVendorRequestStatus() {
    try {
      const response = await fetch("/api/vendor-request");
      const data = await response.json();

      if (response.ok && data.data) {
        setVendorRequest(data.data);
      }
    } catch (error) {
      console.error("Error fetching vendor request status:", error);
    }
  }

  function getRequestStatusBadge() {
    if (!vendorRequest) return null;

    const statusColors: Record<VendorRequest['status'], string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <div className={`px-3 py-1 rounded-full text-sm ${statusColors[vendorRequest.status]}`}>
        {vendorRequest.status.charAt(0).toUpperCase() + vendorRequest.status.slice(1)}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-8">
        {/* Existing dashboard content */}
        
        {/* Become a Vendor section */}
        {session?.user && session.user.role !== "VENDOR" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Become a Vendor</h3>
                <p className="text-sm text-muted-foreground">
                  Start selling your products on our platform
                </p>
              </div>

              {vendorRequest ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Request Status:
                  </span>
                  {getRequestStatusBadge()}
                </div>
              ) : (
                <Link href="/vendor-request">
                  <Button className="gap-2">
                    <Store className="h-4 w-4" />
                    Apply Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 