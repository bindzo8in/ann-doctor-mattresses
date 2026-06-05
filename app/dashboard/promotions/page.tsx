"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit3, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/multi-select";
import { getPromotionsSelectionData } from "@/actions/promotions";
import { toast } from "sonner";
import { PromotionType } from "@/app/generated/prisma/client";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Pagination State
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PromotionType>("BUY_X_GET_Y");
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [getQuantity, setGetQuantity] = useState<number>(1);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  // Dropdown list options
  const [productOptions, setProductOptions] = useState<{ label: string; value: string }[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load promotions list
  const fetchPromotions = (cursor: string | null = null) => {
    setIsLoading(true);
    
    const url = cursor 
      ? `/api/admin/promotions?cursor=${cursor}&limit=10` 
      : "/api/admin/promotions?limit=10";

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.promotions) {
          setPromotions(data.promotions);
          setNextCursor(data.nextCursor || null);
        } else {
          setPromotions(Array.isArray(data) ? data : []);
          setNextCursor(null);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load promotions");
      })
      .finally(() => {
        setIsLoading(false);
        setIsLoadingMore(false);
      });
  };

  const handleNextPage = () => {
    if (!nextCursor) return;
    const nextHistory = [...cursorHistory.slice(0, currentIndex + 1), nextCursor];
    setCursorHistory(nextHistory);
    setCurrentIndex(currentIndex + 1);
    fetchPromotions(nextCursor);
  };

  const handlePrevPage = () => {
    if (currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    fetchPromotions(cursorHistory[prevIndex]);
  };

  useEffect(() => {
    fetchPromotions(null);

    // Fetch products/categories lists for selection options
    getPromotionsSelectionData()
      .then(data => {
        setProductOptions(data.products);
        setCategoryOptions(data.categories);
      })
      .catch(console.error);
  }, []);

  const handleOpenCreate = () => {
    setSelectedPromo(null);
    setName("");
    setDescription("");
    setType("BUY_X_GET_Y");
    setIsActive(true);
    setStartDate("");
    setEndDate("");
    setBuyQuantity(1);
    setGetQuantity(1);
    setProductIds([]);
    setCategoryIds([]);
    setIsOpen(true);
  };

  const handleOpenEdit = (promo: any) => {
    setSelectedPromo(promo);
    setName(promo.name);
    setDescription(promo.description || "");
    setType(promo.type);
    setIsActive(promo.isActive);
    
    // Format dates to YYYY-MM-DDThh:mm for input datetime-local
    const formatDateTime = (dateStr: string | null) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      return d.toISOString().slice(0, 16);
    };
    
    setStartDate(formatDateTime(promo.startDate));
    setEndDate(formatDateTime(promo.endDate));
    setBuyQuantity(promo.buyQuantity ?? 1);
    setGetQuantity(promo.getQuantity ?? 1);
    setProductIds(promo.productIds || []);
    setCategoryIds(promo.categoryIds || []);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Promotion name is required");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      type,
      isActive,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      buyQuantity: Number(buyQuantity) || 1,
      getQuantity: Number(getQuantity) || 1,
      productIds,
      categoryIds,
    };

    try {
      const url = selectedPromo 
        ? `/api/admin/promotions/${selectedPromo.id}` 
        : "/api/admin/promotions";
      const method = selectedPromo ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save promotion");

      toast.success(selectedPromo ? "Promotion updated" : "Promotion created");
      setIsOpen(false);
      fetchPromotions();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving the promotion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this promotion?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete promotion");

      toast.success("Promotion deleted");
      fetchPromotions();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting the promotion");
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promotions Management</h1>
        <Button className="gap-2" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Add Promotion
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No promotions found.</TableCell>
              </TableRow>
            ) : (
              promotions.map(promo => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">
                    <div>{promo.name}</div>
                    {promo.description && <div className="text-xs text-muted-foreground">{promo.description}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-slate-800">Buy {promo.buyQuantity} Get {promo.getQuantity}</div>
                    <div className="text-[10px] text-muted-foreground">BOGO Rule</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={promo.isActive ? "default" : "secondary"}>
                      {promo.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{promo.startDate ? new Date(promo.startDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{promo.endDate ? new Date(promo.endDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(promo)}>
                        <Edit3 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentIndex === 0 || isLoading}
        >
          Previous
        </Button>
        <div className="text-sm font-medium px-2">Page {currentIndex + 1}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!nextCursor || isLoading}
        >
          Next
        </Button>
      </div>

      {/* Promotion Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPromo ? "Edit Promotion" : "Create Promotion"}</DialogTitle>
            <DialogDescription>
              Set up buy-one-get-one rules and date range constraints for mattresses or other products.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Promotion Name *</Label>
              <Input 
                id="name" 
                placeholder="E.g., Monsoon Mattress BOGO" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="E.g., Buy one mattress and get another mattress of the same variant free" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-16 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Promotion Type</Label>
                <Select value={type} onValueChange={(val: PromotionType) => setType(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY_X_GET_Y">BUY X GET Y (BOGO)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox 
                  id="isActive" 
                  checked={isActive} 
                  onCheckedChange={(checked) => setIsActive(!!checked)}
                />
                <Label htmlFor="isActive" className="font-medium cursor-pointer">Active Status</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyQuantity">Buy Quantity *</Label>
                <Input 
                  id="buyQuantity" 
                  type="number" 
                  min="1"
                  value={buyQuantity} 
                  onChange={(e) => setBuyQuantity(Number(e.target.value))} 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="getQuantity">Get Quantity (Free) *</Label>
                <Input 
                  id="getQuantity" 
                  type="number" 
                  min="1"
                  value={getQuantity} 
                  onChange={(e) => setGetQuantity(Number(e.target.value))} 
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="datetime-local" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="datetime-local" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Applicable Products (All if empty)</Label>
              <MultiSelect
                options={productOptions}
                onValueChange={setProductIds}
                defaultValue={productIds}
                placeholder="Select Products"
                maxCount={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Applicable Categories (All if empty)</Label>
              <MultiSelect
                options={categoryOptions}
                onValueChange={setCategoryIds}
                defaultValue={categoryIds}
                placeholder="Select Categories"
                maxCount={2}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Promotion
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
