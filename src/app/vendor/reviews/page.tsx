"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Star,
  MessageSquare,
  Calendar,
  Package,
} from "lucide-react";

interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  response?: string;
  status: "published" | "hidden" | "reported";
}

const mockReviews: Review[] = [
  {
    id: "REV001",
    productId: "PROD001",
    productName: "Wireless Headphones",
    customerName: "John Doe",
    rating: 5,
    comment: "Great sound quality and comfortable to wear for long periods. Battery life is impressive!",
    date: "2024-03-15",
    status: "published",
  },
  {
    id: "REV002",
    productId: "PROD002",
    productName: "Smart Watch",
    customerName: "Jane Smith",
    rating: 4,
    comment: "Nice features but the battery could last longer. Overall good product.",
    date: "2024-03-14",
    response: "Thank you for your feedback! We're working on improving battery life in future models.",
    status: "published",
  },
  {
    id: "REV003",
    productId: "PROD003",
    productName: "Running Shoes",
    customerName: "Mike Johnson",
    rating: 2,
    comment: "The size runs small and the quality is not what I expected.",
    date: "2024-03-13",
    status: "reported",
  },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [responseText, setResponseText] = useState("");

  const filteredReviews = reviews
    .filter((review) => {
      const matchesSearch =
        searchQuery === "" ||
        review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating =
        ratingFilter === "all" || review.rating === Number(ratingFilter);
      const matchesStatus =
        statusFilter === "all" || review.status === statusFilter;
      return matchesSearch && matchesRating && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const handleResponseSubmit = (reviewId: string) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId
          ? { ...review, response: responseText }
          : review
      )
    );
    setResponseText("");
  };

  const handleStatusChange = (reviewId: string, newStatus: Review["status"]) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId ? { ...review, status: newStatus } : review
      )
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
        }`}
      />
    ));
  };

  const getStatusBadgeColor = (status: Review["status"]) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "hidden":
        return "bg-gray-100 text-gray-800";
      case "reported":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-gray-500">Manage customer reviews and feedback</p>
      </div>

      <Card className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Most Recent</SelectItem>
                <SelectItem value="rating">Highest Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <Badge className={getStatusBadgeColor(review.status)}>
                          {review.status.charAt(0).toUpperCase() +
                            review.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="font-medium">{review.customerName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(review.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {review.productName}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Select
                      value={review.status}
                      onValueChange={(value: Review["status"]) =>
                        handleStatusChange(review.id, value)
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                        <SelectItem value="reported">Reported</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Review Content */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p>{review.comment}</p>
                  </div>

                  {/* Vendor Response */}
                  {review.response && (
                    <div className="ml-8 rounded-lg bg-blue-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-800">
                        <MessageSquare className="h-4 w-4" />
                        Your Response
                      </div>
                      <p className="text-blue-800">{review.response}</p>
                    </div>
                  )}

                  {/* Response Form */}
                  {!review.response && (
                    <div className="ml-8 space-y-2">
                      <Textarea
                        placeholder="Write a response..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleResponseSubmit(review.id)}
                        disabled={!responseText.trim()}
                      >
                        Post Response
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
} 