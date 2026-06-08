"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteHeroBanner, reorderHeroBanners, toggleHeroBannerStatus } from "@/actions/hero-banner";
import { BannerFormDialog } from "./banner-form-dialog";

type BannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  backgroundImageUrl: string;
  backgroundPublicId: string;
  foregroundImageUrl: string | null;
  foregroundPublicId: string | null;
  order: number;
  isActive: boolean;
};

// Sortable Row Component
function SortableBannerRow({ 
  banner, 
  onToggle, 
  onEdit, 
  onDelete 
}: { 
  banner: BannerRow, 
  onToggle: (id: string, isActive: boolean) => void,
  onEdit: (banner: BannerRow) => void,
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-3 bg-white border rounded-lg shadow-sm mb-2 group relative">
      <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-700 shrink-0">
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="relative w-24 h-14 rounded overflow-hidden shrink-0 bg-slate-100 border">
        <Image src={banner.backgroundImageUrl} alt={banner.title} fill className="object-cover" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{banner.title}</p>
        <p className="text-xs text-slate-500 truncate">{banner.subtitle || "No subtitle"}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Active</span>
          <Switch 
            checked={banner.isActive} 
            onCheckedChange={(checked) => onToggle(banner.id, checked)} 
          />
        </div>
        
        <div className="flex gap-1 border-l pl-4">
          <Button variant="ghost" size="icon" onClick={() => onEdit(banner)}>
            <Pencil className="w-4 h-4 text-slate-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(banner.id)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HeroTable({ initialBanners }: { initialBanners: BannerRow[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerRow | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleToggle = async (id: string, isActive: boolean) => {
    // Optimistic update
    setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive } : b));
    const result = await toggleHeroBannerStatus(id, isActive);
    if (!result.success) {
      toast.error("Failed to update status");
      setBanners(initialBanners); // Revert
    } else {
      toast.success(isActive ? "Banner activated" : "Banner deactivated");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      const result = await deleteHeroBanner(id);
      if (result.success) {
        setBanners(prev => prev.filter(b => b.id !== id));
        toast.success("Banner deleted");
      } else {
        toast.error("Failed to delete banner");
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = banners.findIndex(b => b.id === active.id);
      const newIndex = banners.findIndex(b => b.id === over.id);
      
      const newBanners = arrayMove(banners, oldIndex, newIndex);
      
      setBanners(newBanners);

      const orderedIds = newBanners.map(b => b.id);
      const result = await reorderHeroBanners(orderedIds);
      if (result.success) {
        toast.success("Banner order updated!");
      } else {
        toast.error("Failed to update order");
      }
    }
  };

  const openCreate = () => {
    setEditingBanner(null);
    setIsFormOpen(true);
  };

  const openEdit = (banner: BannerRow) => {
    setEditingBanner(banner);
    setIsFormOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-lg font-medium">Marketing Banners</h3>
          <p className="text-sm text-slate-500">Manage the slides that appear in the home page hero section.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
        </Button>
      </div>

      <Card className="border-primary/20 shadow-md max-w-4xl">
        <CardHeader className="bg-primary/5 pb-4 border-b">
          <CardTitle className="text-lg">Banner Order ({banners.length})</CardTitle>
          <p className="text-sm text-slate-500">Drag the handles to reorder how they appear in the carousel.</p>
        </CardHeader>
        <CardContent className="p-4 bg-slate-50 min-h-[200px]">
          {banners.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <p>No banners created yet.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={banners.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {banners.map((banner) => (
                  <SortableBannerRow 
                    key={banner.id} 
                    banner={banner} 
                    onToggle={handleToggle} 
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <BannerFormDialog 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen} 
        initialData={editingBanner}
      />
    </>
  );
}
