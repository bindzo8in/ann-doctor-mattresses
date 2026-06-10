"use client";

import { useState, useEffect } from "react";
import { Loader2, PlusIcon, PencilIcon, TrashIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { PhoneInput } from "@/components/ui/phone-input";
import { getBranches, createBranch, updateBranch, deleteBranch } from "@/actions/branches";

type Branch = {
  id: string;
  name: string;
  address: string | null;
  district: string;
  state: string;
  phone: string | null;
  googleMapUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Partial<Branch> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const data = await getBranches();
      setBranches(data);
    } catch (error) {
      toast.error("Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch({ ...branch });
    } else {
      setEditingBranch({ name: "", address: "", district: "", state: "Tamil Nadu", phone: "", googleMapUrl: "", latitude: null, longitude: null, isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSaveBranch = async () => {
    if (!editingBranch?.name) {
      toast.error("Name is required");
      return;
    }

    try {
      setIsSaving(true);
      if (editingBranch.id) {
        await updateBranch(editingBranch.id, {
          name: editingBranch.name,
          address: editingBranch.address || undefined,
          district: editingBranch.district,
          state: editingBranch.state,
          phone: editingBranch.phone || undefined,
          googleMapUrl: editingBranch.googleMapUrl || undefined,
          latitude: editingBranch.latitude || undefined,
          longitude: editingBranch.longitude || undefined,
          isActive: editingBranch.isActive,
        });
        toast.success("Branch updated");
      } else {
        await createBranch({
          name: editingBranch.name,
          address: editingBranch.address || undefined,
          district: editingBranch.district || "",
          state: editingBranch.state,
          phone: editingBranch.phone || undefined,
          googleMapUrl: editingBranch.googleMapUrl || undefined,
          latitude: editingBranch.latitude || undefined,
          longitude: editingBranch.longitude || undefined,
          isActive: editingBranch.isActive,
        });
        toast.success("Branch created");
      }
      setIsModalOpen(false);
      fetchBranches();
    } catch (error: any) {
      toast.error(error.message || "Failed to save branch");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;

    try {
      await deleteBranch(id);
      toast.success("Branch deleted");
      fetchBranches();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete branch");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Branches</h1>
        <p className="text-slate-500 mt-1">Manage physical branches for order fulfillment.</p>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Locations</h2>
            <p className="text-sm text-slate-500 mt-1">Add or edit branches and assign them active status.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <PlusIcon className="w-4 h-4" /> Add Branch
          </Button>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Branch Name</TableHead>
                <TableHead>State & District</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell className="text-slate-600">
                    {branch.state && branch.district ? `${branch.district}, ${branch.state}` : (branch.state || branch.district || "-")}
                  </TableCell>
                  <TableCell className="text-slate-600">{branch.address || "-"}</TableCell>
                  <TableCell className="text-slate-600">{branch.phone || "-"}</TableCell>
                  <TableCell>
                    {branch.isActive ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-xs font-medium">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(branch)}>
                        <PencilIcon className="w-4 h-4 text-slate-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteBranch(branch.id)}>
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {branches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No branches configured.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBranch?.id ? "Edit Branch" : "New Branch"}</DialogTitle>
          </DialogHeader>
          
          {editingBranch && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Branch Name</label>
                <Input 
                  value={editingBranch.name || ""} 
                  onChange={e => setEditingBranch({...editingBranch, name: e.target.value})}
                  placeholder="e.g., Main Hub" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">State</label>
                <Input 
                  value={editingBranch.state || ""} 
                  onChange={e => setEditingBranch({...editingBranch, state: e.target.value})}
                  placeholder="e.g., Tamil Nadu" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">District</label>
                <Input 
                  value={editingBranch.district || ""} 
                  onChange={e => setEditingBranch({...editingBranch, district: e.target.value})}
                  placeholder="e.g., Coimbatore" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Address</label>
                <Input 
                  value={editingBranch.address || ""} 
                  onChange={e => setEditingBranch({...editingBranch, address: e.target.value})}
                  placeholder="e.g., 123 Street, City" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <PhoneInput 
                  defaultCountry="IN"
                  value={editingBranch.phone || ""} 
                  onChange={value => setEditingBranch({...editingBranch, phone: value ? value.toString() : ""})}
                  placeholder="e.g., +91 98765 43210"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Google Map URL</label>
                <Input 
                  value={editingBranch.googleMapUrl || ""} 
                  onChange={e => setEditingBranch({...editingBranch, googleMapUrl: e.target.value})}
                  placeholder="e.g., https://goo.gl/maps/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Latitude (Optional)</label>
                  <Input 
                    type="number"
                    step="any"
                    value={editingBranch.latitude || ""} 
                    onChange={e => setEditingBranch({...editingBranch, latitude: parseFloat(e.target.value) || null})}
                    placeholder="Auto-fetched"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Longitude (Optional)</label>
                  <Input 
                    type="number"
                    step="any"
                    value={editingBranch.longitude || ""} 
                    onChange={e => setEditingBranch({...editingBranch, longitude: parseFloat(e.target.value) || null})}
                    placeholder="Auto-fetched"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 mt-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Active Status</p>
                  <p className="text-xs text-slate-500">Turn off to disable this branch temporarily.</p>
                </div>
                <Switch 
                  checked={editingBranch.isActive}
                  onCheckedChange={(checked: boolean) => setEditingBranch({...editingBranch, isActive: checked})}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBranch} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
