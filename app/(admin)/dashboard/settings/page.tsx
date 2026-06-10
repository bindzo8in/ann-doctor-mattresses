"use client"

import { useState, useEffect } from "react"
import { Loader2, PlusIcon, PencilIcon, TrashIcon, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

type DeliveryZone = {
  id: string
  name: string
  pincodePrefixes: string[]
  charge: number
  isDefault: boolean
}

export default function SettingsPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<Partial<DeliveryZone> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fetchZones = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/settings/delivery-zones")
      const data = await res.json()
      if (res.ok) {
        // Convert Decimal string to number for UI
        const formatted = data.map((z: any) => ({ ...z, charge: Number(z.charge) }))
        setZones(formatted)
      } else {
        toast.error("Failed to load delivery zones")
      }
    } catch (error) {
      toast.error("An error occurred while loading zones")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchZones()
  }, [])

  const handleOpenModal = (zone?: DeliveryZone) => {
    if (zone) {
      setEditingZone({ ...zone })
    } else {
      setEditingZone({ name: "", pincodePrefixes: [], charge: 50, isDefault: false })
    }
    setIsModalOpen(true)
  }

  const handleSaveZone = async () => {
    if (!editingZone?.name || editingZone.charge === undefined) {
      toast.error("Name and charge are required")
      return
    }

    try {
      setIsSaving(true)
      const method = editingZone.id ? "PUT" : "POST"
      const res = await fetch("/api/admin/settings/delivery-zones", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingZone)
      })

      if (res.ok) {
        toast.success(editingZone.id ? "Zone updated" : "Zone created")
        setIsModalOpen(false)
        fetchZones()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save zone")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteZone = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      toast.error("Cannot delete the default zone. Assign default to another zone first.")
      return
    }

    if (!confirm("Are you sure you want to delete this zone?")) return

    try {
      const res = await fetch(`/api/admin/settings/delivery-zones?id=${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("Zone deleted")
        fetchZones()
      } else {
        toast.error("Failed to delete zone")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-1">Manage global store configurations and delivery rules.</p>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/dashboard/settings/branches'}>
          Manage Branches
        </Button>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Delivery Zones</h2>
            <p className="text-sm text-slate-500 mt-1">Configure shipping charges based on the first digit of the customer's pincode.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <PlusIcon className="w-4 h-4" /> Add Zone
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
                <TableHead>Zone Name</TableHead>
                <TableHead>Pincode Prefixes</TableHead>
                <TableHead>Charge (₹)</TableHead>
                <TableHead>Default</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>
                    {zone.pincodePrefixes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {zone.pincodePrefixes.map(p => (
                          <span key={p} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs font-mono font-medium border border-slate-200">
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-sm">None (Fallback)</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">₹{zone.charge}</TableCell>
                  <TableCell>
                    {zone.isDefault ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Default
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(zone)}>
                        <PencilIcon className="w-4 h-4 text-slate-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteZone(zone.id, zone.isDefault)} disabled={zone.isDefault}>
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {zones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No delivery zones configured.
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
            <DialogTitle>{editingZone?.id ? "Edit Delivery Zone" : "New Delivery Zone"}</DialogTitle>
          </DialogHeader>
          
          {editingZone && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Zone Name</label>
                <Input 
                  value={editingZone.name} 
                  onChange={e => setEditingZone({...editingZone, name: e.target.value})}
                  placeholder="e.g., South India" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Pincode Prefixes</label>
                <Input 
                  value={editingZone.pincodePrefixes?.join(", ")} 
                  onChange={e => {
                    const prefixes = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                    setEditingZone({...editingZone, pincodePrefixes: prefixes});
                  }}
                  placeholder="e.g., 5, 6" 
                />
                <p className="text-xs text-slate-500">Comma-separated list of the first digits of pincodes for this zone.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Delivery Charge (₹)</label>
                <Input 
                  type="number" 
                  min="0"
                  value={editingZone.charge} 
                  onChange={e => setEditingZone({...editingZone, charge: Number(e.target.value)})}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 mt-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Set as Default Fallback</p>
                  <p className="text-xs text-slate-500">Use this rate if pincode doesn't match any prefixes.</p>
                </div>
                <Switch 
                  checked={editingZone.isDefault}
                  onCheckedChange={(checked: boolean) => setEditingZone({...editingZone, isDefault: checked})}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveZone} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
