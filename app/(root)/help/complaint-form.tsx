"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import { submitComplaint } from "@/actions/support";

export function ComplaintForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Simple validation
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const message = formData.get("message") as string;
      
      if (!name || !email || !message) {
        toast.error("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }

      await submitComplaint(formData);
      setIsSuccess(true);
      toast.success("Complaint submitted successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to submit complaint. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Complaint Logged</h3>
        <p className="text-slate-600 max-w-md">
          Thank you for reaching out. We have sent a confirmation to your email address and our support team will get back to you shortly.
        </p>
        <Button 
          variant="outline" 
          className="mt-6"
          onClick={() => setIsSuccess(false)}
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-slate-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input id="name" name="name" required placeholder="John Doe" disabled={isSubmitting} />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input id="email" name="email" type="email" required placeholder="john@example.com" disabled={isSubmitting} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-semibold text-slate-700">
          Subject
        </label>
        <Input id="subject" name="subject" placeholder="Order issue, Product defect, etc." disabled={isSubmitting} />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-semibold text-slate-700">
          Complaint Details <span className="text-red-500">*</span>
        </label>
        <Textarea 
          id="message" 
          name="message" 
          required 
          placeholder="Please describe the issue in detail..." 
          className="min-h-[150px]"
          disabled={isSubmitting} 
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="image" className="text-sm font-semibold text-slate-700">
          Screenshot / Photo (Optional)
        </label>
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
          <Input 
            id="image" 
            name="image" 
            type="file" 
            accept="image/*" 
            className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:cursor-pointer file:font-medium hover:file:bg-primary/90 text-sm text-slate-500 cursor-pointer"
            disabled={isSubmitting}
          />
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <UploadCloud className="w-3 h-3" /> Max file size: 5MB. Supported formats: JPG, PNG, WEBP.
          </p>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" size="lg" className="w-full md:w-auto px-8" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Submit Complaint
        </Button>
      </div>
    </form>
  );
}
