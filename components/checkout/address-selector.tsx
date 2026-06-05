"use client";

import React, { useState, useEffect } from "react";
import { Check, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addressSchema } from "@/lib/schema/checkout-schema";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export function AddressSelector({ 
  selectedAddressId, 
  onSelect,
  onSelectAddress
}: { 
  selectedAddressId: string | null; 
  onSelect: (id: string) => void;
  onSelectAddress?: (address: Address) => void;
}) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New address state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        if (!selectedAddressId && data.length > 0) {
          const defaultAddr = data.find((a: Address) => a.isDefault) || data[0];
          onSelect(defaultAddr.id);
          onSelectAddress?.(defaultAddr);
        }
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Client-side validation using addressSchema
    const validationResult = addressSchema.safeParse(formData);
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
        setOpen(false);
        fetchAddresses();
        onSelect(newAddress.id);
        onSelectAddress?.(newAddress);
        // Reset form
        setFormData({
          fullName: "", phone: "", addressLine1: "", addressLine2: "",
          city: "", state: "", postalCode: "", country: "India", isDefault: false,
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

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shipping Address</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input id="addressLine1" required value={formData.addressLine1} onChange={(e) => setFormData({...formData, addressLine1: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input id="addressLine2" value={formData.addressLine2} onChange={(e) => setFormData({...formData, addressLine2: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" required value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" required value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Address"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center p-6 border rounded-lg bg-gray-50 text-muted-foreground">
          No addresses found. Please add an address to continue.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`cursor-pointer transition-all ${selectedAddressId === address.id ? 'border-primary ring-1 ring-primary' : 'hover:border-gray-400'}`}
              onClick={() => {
                onSelect(address.id);
                onSelectAddress?.(address);
              }}
            >
              <CardContent className="p-4 relative">
                {selectedAddressId === address.id && (
                  <div className="absolute top-4 right-4 text-primary">
                    <Check className="w-5 h-5" />
                  </div>
                )}
                <div className="font-semibold">{address.fullName}</div>
                <div className="text-sm mt-1 text-muted-foreground">{address.phone}</div>
                <div className="text-sm mt-2 text-muted-foreground">
                  {address.addressLine1}
                  {address.addressLine2 && <><br />{address.addressLine2}</>}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                  <br />
                  {address.country}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
