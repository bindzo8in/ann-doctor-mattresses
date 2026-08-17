"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Check, Plus, Loader2, MapPin, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addressSchema } from "@/lib/schema/checkout-schema";
import { PhoneInput } from "@/components/ui/phone-input";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { routes } from "@/lib/routes";

export interface CheckoutAddress {
  id?: string;
  fullName: string;
  email?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

const GUEST_STORAGE_KEY = "ann_guest_checkout_address";

export function AddressSelector({
  selectedAddressId,
  onSelect,
  onSelectAddress,
}: {
  selectedAddressId: string | null;
  onSelect: (id: string) => void;
  onSelectAddress?: (address: CheckoutAddress) => void;
}) {
  const { data: session, isPending: isAuthPending } = useSession();
  const isAuthenticated = !!session?.user;

  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guest Address State
  const [guestData, setGuestData] = useState<CheckoutAddress>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(GUEST_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      fullName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    };
  });

  // Modal new address state for authenticated users
  const [modalFormData, setModalFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        if (!selectedAddressId && data.length > 0) {
          const defaultAddr = data.find((a: CheckoutAddress) => a.isDefault) || data[0];
          onSelect(defaultAddr.id || defaultAddr.fullName);
          onSelectAddress?.(defaultAddr);
        }
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, selectedAddressId, onSelect, onSelectAddress]);

  useEffect(() => {
    if (!isAuthPending) {
      fetchAddresses();
    }
  }, [isAuthPending, fetchAddresses]);

  // Sync guest address changes
  const handleGuestFieldChange = (field: keyof CheckoutAddress, value: any) => {
    const updated = { ...guestData, [field]: value };
    setGuestData(updated);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
    }

    // Validate with addressSchema
    const validation = addressSchema.safeParse(updated);
    if (validation.success) {
      onSelect("guest-address");
      onSelectAddress?.(validation.data as CheckoutAddress);
    } else {
      // Still propagate for pincode calculation if pincode is valid 6-digit
      if (updated.postalCode && /^[1-9]\d{5}$/.test(updated.postalCode.replace(/\s+/g, ""))) {
        onSelectAddress?.(updated);
      }
    }
  };

  // Initial notify for guest address if already saved in localStorage
  useEffect(() => {
    if (!isAuthenticated && guestData.fullName && guestData.addressLine1 && guestData.postalCode) {
      const validation = addressSchema.safeParse(guestData);
      if (validation.success) {
        onSelect("guest-address");
        onSelectAddress?.(validation.data as CheckoutAddress);
      }
    }
  }, [isAuthenticated]);

  const handleAuthenticatedAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationResult = addressSchema.safeParse(modalFormData);
    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0].message);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validationResult.data),
      });

      if (res.ok) {
        const newAddress = await res.json();
        toast.success("Address added successfully");
        setOpenAddDialog(false);
        fetchAddresses();
        onSelect(newAddress.id);
        onSelectAddress?.(newAddress);
        setModalFormData({
          fullName: "",
          email: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
          isDefault: false,
        });
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to add address");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isAuthPending) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  // --- Authenticated User View ---
  if (isAuthenticated && addresses.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">Saved Addresses</h3>
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAuthenticatedAddSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authFullName">Full Name</Label>
                    <Input
                      id="authFullName"
                      required
                      value={modalFormData.fullName}
                      onChange={(e) => setModalFormData({ ...modalFormData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authPhone">Phone Number</Label>
                    <PhoneInput
                      id="authPhone"
                      defaultCountry="IN"
                      required
                      value={modalFormData.phone}
                      onChange={(value) => setModalFormData({ ...modalFormData, phone: value ? value.toString() : "" })}
                      prefix="+"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authEmail">Email Address (Optional)</Label>
                  <Input
                    id="authEmail"
                    type="email"
                    placeholder="For order updates"
                    value={modalFormData.email}
                    onChange={(e) => setModalFormData({ ...modalFormData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authAddressLine1">Address Line 1</Label>
                  <Input
                    id="authAddressLine1"
                    required
                    value={modalFormData.addressLine1}
                    onChange={(e) => setModalFormData({ ...modalFormData, addressLine1: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authAddressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="authAddressLine2"
                    value={modalFormData.addressLine2}
                    onChange={(e) => setModalFormData({ ...modalFormData, addressLine2: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authCity">City</Label>
                    <Input
                      id="authCity"
                      required
                      value={modalFormData.city}
                      onChange={(e) => setModalFormData({ ...modalFormData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authState">State</Label>
                    <Input
                      id="authState"
                      required
                      value={modalFormData.state}
                      onChange={(e) => setModalFormData({ ...modalFormData, state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authPostalCode">Postal Code (PIN)</Label>
                    <Input
                      id="authPostalCode"
                      required
                      maxLength={6}
                      value={modalFormData.postalCode}
                      onChange={(e) => setModalFormData({ ...modalFormData, postalCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authCountry">Country</Label>
                    <Input
                      id="authCountry"
                      required
                      disabled
                      value={modalFormData.country}
                      onChange={(e) => setModalFormData({ ...modalFormData, country: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Address"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`cursor-pointer transition-all ${
                selectedAddressId === address.id
                  ? "border-primary ring-2 ring-primary/20 bg-slate-50/50"
                  : "hover:border-slate-300"
              }`}
              onClick={() => {
                if (address.id) onSelect(address.id);
                onSelectAddress?.(address);
              }}
            >
              <CardContent className="p-4 relative">
                {selectedAddressId === address.id && (
                  <div className="absolute top-4 right-4 text-primary bg-primary/10 rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div className="font-semibold text-slate-900">{address.fullName}</div>
                <div className="text-sm mt-1 text-slate-600">{address.phone}</div>
                <div className="text-sm mt-2 text-slate-500 leading-relaxed">
                  {address.addressLine1}
                  {address.addressLine2 && <><br />{address.addressLine2}</>}
                  <br />
                  {address.city}, {address.state} - <span className="font-semibold">{address.postalCode}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // --- Guest or Direct Address Entry View ---
  return (
    <div className="space-y-6">
      {!isAuthenticated && (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
          <span>Checking out as Guest.</span>
          <Link
            href={`${routes.login}?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/checkout")}`}
            className="font-semibold text-primary hover:underline"
          >
            Have an account? Log In
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guestFullName" className="text-xs font-semibold uppercase text-slate-700">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="guestFullName"
              placeholder="e.g. Rahul Sharma"
              required
              value={guestData.fullName}
              onChange={(e) => handleGuestFieldChange("fullName", e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestPhone" className="text-xs font-semibold uppercase text-slate-700">
            Mobile Number <span className="text-red-500">*</span>
          </Label>
          <PhoneInput
            id="guestPhone"
            defaultCountry="IN"
            required
            value={guestData.phone}
            onChange={(value) => handleGuestFieldChange("phone", value ? value.toString() : "")}
            prefix="+"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestEmail" className="text-xs font-semibold uppercase text-slate-700">
          Email Address <span className="text-slate-400 font-normal">(for order confirmation & updates)</span>
        </Label>
        <Input
          id="guestEmail"
          type="email"
          placeholder="e.g. rahul@example.com"
          value={guestData.email || ""}
          onChange={(e) => handleGuestFieldChange("email", e.target.value)}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestAddressLine1" className="text-xs font-semibold uppercase text-slate-700">
          Flat, House No., Building, Street <span className="text-red-500">*</span>
        </Label>
        <Input
          id="guestAddressLine1"
          placeholder="e.g. Flat 402, Sunshine Apartments, 12th Main Road"
          required
          value={guestData.addressLine1}
          onChange={(e) => handleGuestFieldChange("addressLine1", e.target.value)}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestAddressLine2" className="text-xs font-semibold uppercase text-slate-700">
          Area, Landmark (Optional)
        </Label>
        <Input
          id="guestAddressLine2"
          placeholder="e.g. Near City Park / Opposite Metro Pillar 45"
          value={guestData.addressLine2 || ""}
          onChange={(e) => handleGuestFieldChange("addressLine2", e.target.value)}
          className="h-11"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guestPostalCode" className="text-xs font-semibold uppercase text-slate-700">
            PIN Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="guestPostalCode"
            placeholder="6-digit PIN code"
            required
            maxLength={6}
            value={guestData.postalCode}
            onChange={(e) => handleGuestFieldChange("postalCode", e.target.value)}
            className="h-11 font-medium"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestCity" className="text-xs font-semibold uppercase text-slate-700">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="guestCity"
            placeholder="e.g. Chennai"
            required
            value={guestData.city}
            onChange={(e) => handleGuestFieldChange("city", e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestState" className="text-xs font-semibold uppercase text-slate-700">
            State <span className="text-red-500">*</span>
          </Label>
          <Input
            id="guestState"
            placeholder="e.g. Tamil Nadu"
            required
            value={guestData.state}
            onChange={(e) => handleGuestFieldChange("state", e.target.value)}
            className="h-11"
          />
        </div>
      </div>
    </div>
  );
}
