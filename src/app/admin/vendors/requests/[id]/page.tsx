"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Store } from "lucide-react";
import { toast } from "sonner";

interface VendorRequest {
  _id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  businessType: string;
  description: string;
  documents: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export default function VendorRequestDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [request, setRequest] = useState<VendorRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/admin/vendor-requests/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch request");
      }
      const data = await response.json();
      setRequest(data);
    } catch {
      toast.error("Error fetching request details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchRequest();
    }
  }, [session, params.id, fetchRequest]);

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/vendor-requests/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedRequest = await response.json();
      setRequest(updatedRequest);
      toast.success(`Request ${status} successfully`);
    } catch {
      toast.error("Error updating request status");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Request Not Found</h1>
          <p className="text-muted-foreground">
            The vendor request you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{request.businessName}</CardTitle>
              <CardDescription>Vendor Application Details</CardDescription>
            </div>
            <Badge
              variant={
                request.status === "approved"
                  ? "default"
                  : request.status === "rejected"
                  ? "destructive"
                  : "secondary"
              }
            >
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <h3 className="font-semibold">Business Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="font-medium">{request.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Business Type</p>
                  <p className="font-medium">{request.businessType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner Name</p>
                  <p className="font-medium">{request.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{request.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{request.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{request.address}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground">{request.description}</p>
            </div>

            {request.status === "pending" && (
              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Reject"
                  )}
                </Button>
                <Button
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Approve"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 