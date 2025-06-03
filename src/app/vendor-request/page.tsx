"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import VendorRequestForm from "@/components/forms/VendorRequestForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface VendorRequest {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  storeName: string;
  storeDescription: string;
  createdAt: string;
}

export default function VendorRequestPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [vendorRequest, setVendorRequest] = useState<VendorRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if user is not logged in or is already a vendor
    if (!session?.user) {
      router.push("/login");
    } else if (session.user.role === "VENDOR") {
      router.push("/dashboard");
    } else {
      fetchVendorRequest();
    }
  }, [session, router]);

  async function fetchVendorRequest() {
    try {
      const response = await fetch("/api/vendor-request");
      const data = await response.json();

      if (response.ok && data.data) {
        setVendorRequest(data.data);
      }
    } catch (error) {
      console.error("Error fetching vendor request:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!session?.user || session.user.role === "VENDOR") {
    return null;
  }

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status: VendorRequest['status']) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Card>
        {vendorRequest ? (
          <>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Vendor Application Status</CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(vendorRequest.status)}`}>
                  {vendorRequest.status.charAt(0).toUpperCase() + vendorRequest.status.slice(1)}
                </span>
              </div>
              <CardDescription>
                {vendorRequest.status === 'pending' && "Your application is being reviewed by our team."}
                {vendorRequest.status === 'approved' && "Congratulations! Your application has been approved."}
                {vendorRequest.status === 'rejected' && "Unfortunately, your application has been rejected."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Store Name</h3>
                <p className="text-muted-foreground">{vendorRequest.storeName}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Store Description</h3>
                <p className="text-muted-foreground">{vendorRequest.storeDescription}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Submitted On</h3>
                <p className="text-muted-foreground">
                  {new Date(vendorRequest.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Become a Vendor</CardTitle>
              <CardDescription>
                Fill out the form below to start selling on our platform. Our team will review your application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorRequestForm onSuccess={fetchVendorRequest} />
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
} 