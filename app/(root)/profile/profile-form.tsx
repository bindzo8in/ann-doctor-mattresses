"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Mail, User, Lock } from "lucide-react";
import { updateCustomerProfile } from "@/actions/profile";

interface ProfileFormProps {
  initialUser: {
    name?: string | null;
    email?: string | null;
  };
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const [name, setName] = useState(initialUser.name || "");
  const [email, setEmail] = useState(initialUser.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateCustomerProfile({
        name,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      toast.success("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
        <p className="text-sm text-slate-500">Update your account details and password.</p>
      </div>

      <div className="space-y-4">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" /> Full Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
          />
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" /> Email Address
          </label>
          <div className="space-y-1">
            <Input
              type="email"
              value={email}
              disabled
              readOnly
              className="bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500">
              Your email address cannot be changed.
            </p>
          </div>
        </div>

        <hr className="my-6 border-slate-100" />

        {/* Change Password Section */}
        <div className="space-y-2">
          <h3 className="text-md font-bold text-slate-900">Change Password</h3>
          <p className="text-xs text-slate-500">Leave these fields blank if you do not wish to change your password.</p>
        </div>

        {/* Current Password Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" /> Current Password
          </label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {/* New Password Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" /> New Password
          </label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting} size="lg" className="px-8">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
