"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApprovedReviews, canUserReviewProduct, createReview } from "@/actions/reviews";
import { Star, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";

interface ProductReviewsProps {
  productId: string;
  initialReviews: any[];
  initialCanReview: boolean;
}

export function ProductReviews({ productId, initialReviews, initialCanReview }: ProductReviewsProps) {

  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["product_reviews", productId],
    queryFn: async () => {
      const [reviewsRes, canReviewRes] = await Promise.all([
        getApprovedReviews(productId),
        canUserReviewProduct(productId)
      ]);
      return {
        reviews: reviewsRes.success && reviewsRes.reviews ? reviewsRes.reviews : [],
        canReview: canReviewRes
      };
    },
    initialData: {
      reviews: initialReviews,
      canReview: initialCanReview
    }
  });


  const reviews = data?.reviews || [];
  const canReview = data?.canReview || false;

  const submitMutation = useMutation({
    mutationFn: async (payload: { productId: string, rating: number, title: string, comment: string }) => {
      const res = await createReview(payload.productId, payload.rating, payload.title, payload.comment);
      if (!res.success) throw new Error(res.error || "Failed to submit review");
      return res;
    },
    onSuccess: () => {
      toast.success("Review submitted successfully! It will be visible after admin approval.");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["product_reviews", productId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit review.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter a review comment.");
      return;
    }
    submitMutation.mutate({ productId, rating, title, comment });
  };

  const isSubmitting = submitMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${i < Math.round(averageRating) ? "fill-amber-500" : "fill-slate-200 text-slate-200"}`} 
                />
              ))}
            </div>
            <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
            <span className="text-slate-500 text-sm">based on {reviews.length} reviews</span>
          </div>
        </div>
        
        {canReview && !showForm && (
          <Button onClick={() => setShowForm(true)}>Write a Review</Button>
        )}
      </div>

      {showForm && (
        <div className="bg-slate-50 p-6 rounded-xl border">
          <h3 className="font-semibold text-lg mb-4">Write Your Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`w-8 h-8 ${rating >= star ? "fill-amber-500 text-amber-500" : "text-slate-300"}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Review Title (Optional)</label>
              <Input 
                placeholder="Summary of your experience" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Review Comment</label>
              <Textarea 
                placeholder="What did you like or dislike?" 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Review
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
            No reviews yet. Check back later!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-xl p-5 space-y-3 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border overflow-hidden">
                      {review.user?.image ? (
                        <div className="relative w-full h-full">
                          <Image src={review.user.image} alt={review.user.name || "User"} fill className="object-cover" sizes="40px" />
                        </div>
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{review.user?.name || "Customer"}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          month: "long", day: "numeric", year: "numeric"
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-500" : "fill-slate-200 text-slate-200"}`} 
                        />
                      ))}
                    </div>
                    {/* The any cast handles if TS doesn't know isApproved is returned, but we know Prisma returns all fields */}
                    {!(review as any).isApproved && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">
                        Pending Approval
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {review.title && <h4 className="font-bold text-slate-900 mb-1">{review.title}</h4>}
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
