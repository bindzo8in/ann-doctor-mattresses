"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getAdminReviews, toggleReviewApproval, deleteReview } from "@/actions/reviews";
import Image from "next/image";

export default function ReviewsPage() {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ["admin_reviews"],
    queryFn: async () => {
      const res = await getAdminReviews();
      if (!res.success) throw new Error(res.error);
      return res.reviews || [];
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ reviewId, currentStatus }: { reviewId: string, currentStatus: boolean }) => 
      toggleReviewApproval(reviewId, !currentStatus),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success(`Review ${!variables.currentStatus ? 'approved' : 'rejected'}`);
        queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
      } else {
        toast.error(res.error || "Failed to update review status");
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Review deleted");
        queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
      } else {
        toast.error(res.error || "Failed to delete review");
      }
    }
  });

  const handleToggleApproval = (reviewId: string, currentStatus: boolean) => {
    toggleMutation.mutate({ reviewId, currentStatus });
  };

  const handleDelete = (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    deleteMutation.mutate(reviewId);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Reviews</h1>
          <p className="text-sm text-slate-500">Manage customer reviews and approve them for public display.</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          Refresh List
        </Button>
      </div>

      <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Product</TableHead>
              <TableHead className="font-semibold text-slate-700">Customer</TableHead>
              <TableHead className="font-semibold text-slate-700">Rating</TableHead>
              <TableHead className="font-semibold text-slate-700">Review</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No reviews found.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id} className="hover:bg-slate-50/50">
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-3">
                      {review.product.thumbnailUrl && (
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 border">
                          <Image src={review.product.thumbnailUrl} alt={review.product.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="font-medium text-slate-800 line-clamp-2 max-w-[200px]">{review.product.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium text-slate-800">{review.user?.name || "Unknown"}</div>
                    <div className="text-slate-400 text-xs">{review.user?.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-500" : "fill-slate-200 text-slate-200"}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm max-w-[300px]">
                    {review.title && <div className="font-semibold text-slate-800 mb-1">{review.title}</div>}
                    <div className="text-slate-600 text-xs line-clamp-3">{review.comment}</div>
                    <div className="text-slate-400 text-[10px] mt-1">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {review.isApproved ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1.5 px-2 py-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1.5 px-2 py-0.5">
                        <Loader2 className="w-3 h-3" /> Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleApproval(review.id, review.isApproved)}
                      disabled={toggleMutation.isPending && toggleMutation.variables?.reviewId === review.id}
                      className={review.isApproved ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
                    >
                      {toggleMutation.isPending && toggleMutation.variables?.reviewId === review.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : review.isApproved ? (
                        <>Reject</>
                      ) : (
                        <>Approve</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => handleDelete(review.id)}
                      disabled={deleteMutation.isPending && deleteMutation.variables === review.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
