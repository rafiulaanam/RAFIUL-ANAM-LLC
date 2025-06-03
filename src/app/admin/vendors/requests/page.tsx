"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Store,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VendorRequest {
  _id: string;
  userId: string;
  name: string;
  email: string;
  image?: string;
  phone: string;
  address: string;
  storeName: string;
  storeDescription: string;
  businessType: string;
  registrationNumber: string;
  taxId: string;
  documents: Array<{
    type: string;
    url: string;
  }>;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  processedBy?: string;
  processedAt?: string;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export default function VendorRequestsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    
    if (!session || session.user.role !== "ADMIN") {
      router.push("/dashboard");
    } else {
      fetchRequests();
    }
  }, [session, sessionStatus, router]);

  async function fetchRequests() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/vendor-requests");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch vendor requests");
      }

      setRequests(data.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch vendor requests";
      setError(message);
      toast.error("Error", { description: message });
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestUpdate(requestId: string, status: "approved" | "rejected") {
    try {
      setProcessingId(requestId);
      const response = await fetch(`/api/admin/vendor-requests`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update request status");
      }

      toast.success("Success", {
        description: `Vendor request ${status === "approved" ? "approved" : "rejected"} successfully`,
      });

      // Update the request in the list with proper typing
      setRequests(requests.map(request => {
        if (request._id === requestId) {
          return {
            ...request,
            status,
            processedBy: session?.user?.email || undefined,
            processedAt: new Date().toISOString()
          };
        }
        return request;
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update request status";
      toast.error("Error", { description: message });
    } finally {
      setProcessingId(null);
    }
  }

  const filteredRequests = requests.filter(request => 
    request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.businessType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  if (sessionStatus === "loading") {
    return (
      <div className="flex h-[200px] w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Vendor Requests</CardTitle>
              <CardDescription>
                Review and manage vendor applications
              </CardDescription>
            </div>
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : loading ? (
            <div className="flex h-[200px] w-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <div className="max-h-[70vh] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[250px]">Applicant</TableHead>
                      <TableHead className="w-[300px]">Store</TableHead>
                      <TableHead className="w-[200px]">Contact</TableHead>
                      <TableHead className="w-[150px]">Documents</TableHead>
                      <TableHead className="w-[150px]">Status</TableHead>
                      <TableHead className="w-[120px]">Applied</TableHead>
                      <TableHead className="w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell className="max-w-[250px]">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={request.user?.image} />
                              <AvatarFallback>{getInitials(request.user?.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{request.user?.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {request.user?.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="flex flex-col">
                            <span className="font-medium truncate">{request.storeName}</span>
                            <span className="text-sm text-muted-foreground truncate">
                              {request.storeDescription}
                            </span>
                            <div className="mt-1 flex flex-col gap-0.5">
                              <span className="text-xs text-muted-foreground truncate">
                                Business Type: {request.businessType}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                Reg. No: {request.registrationNumber}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                Tax ID: {request.taxId}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-2 truncate">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{request.user?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 truncate">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{request.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 truncate">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{request.address}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {request.documents?.map((doc, index) => (
                              <a
                                key={index}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                              >
                                <FileText className="h-4 w-4" />
                                {doc.type}
                              </a>
                            )) || "No documents"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
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
                            {request.processedBy && (
                              <div className="flex flex-col text-xs text-muted-foreground">
                                <span>by {request.processedBy}</span>
                                <span>
                                  on {new Date(request.processedAt!).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {request.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleRequestUpdate(request._id, "approved")}
                                  disabled={processingId === request._id}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRequestUpdate(request._id, "rejected")}
                                  disabled={processingId === request._id}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/vendors/requests/${request._id}`)}
                            >
                              <Store className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredRequests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          {searchQuery ? "No vendor requests found matching your search" : "No vendor requests found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 