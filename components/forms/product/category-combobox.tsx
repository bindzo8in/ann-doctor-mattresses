"use client";

import { ChevronsUpDown, Check, Plus, Pencil, Trash } from "lucide-react";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useMemo, useRef, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/helpers/category";

import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { ImageUpload, type UploadedImage } from "@/components/ui/image-upload";

interface Props {
  value?: string;
  onChange: (value: string) => void;
}

export function CategoryCombobox({
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();
  const loaderRef = useRef<HTMLDivElement>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createThumbnail, setCreateThumbnail] = useState<UploadedImage | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editThumbnail, setEditThumbnail] = useState<UploadedImage | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const selectedCategory = useQuery({
    queryKey: ["category", value],
    queryFn: () => getCategory(value!),
    enabled: !!value,
  });

  const categories = useInfiniteQuery({
    queryKey: ["categories", debouncedSearch],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      getCategories({
        search: debouncedSearch,
        cursor: pageParam ?? undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const items = useMemo(
    () => categories.data?.pages.flatMap((page) => page.items) ?? [],
    [categories.data]
  );

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (
        entry.isIntersecting &&
        categories.hasNextPage &&
        !categories.isFetchingNextPage
      ) {
        categories.fetchNextPage();
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [categories]);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess(category) {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.setQueryData(["category", category.id], category);
      onChange(category.id);
      setOpen(false);
      setCreateOpen(false);
      setCreateName("");
      setCreateThumbnail(null);
      toast.success("Category created successfully");
    },
    onError(error: Error) {
      toast.error(error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; name: string; thumbnailUrl?: string | null; thumbnailPublicId?: string | null }) =>
      updateCategory(data.id, { name: data.name, thumbnailUrl: data.thumbnailUrl, thumbnailPublicId: data.thumbnailPublicId }),
    onSuccess(category) {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.setQueryData(["category", category.id], category);
      setEditOpen(false);
      toast.success("Category updated successfully");
    },
    onError(error: Error) {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.removeQueries({ queryKey: ["category", value] });
      onChange("");
      setDeleteOpen(false);
      toast.success("Category deleted successfully");
    },
    onError(error: Error) {
      toast.error(error.message);
      setDeleteOpen(false);
    }
  });

  const exists = items.some(
    (x) => x.name.toLowerCase() === search.toLowerCase()
  );

  const handleEditClick = () => {
    if (selectedCategory.data) {
      setEditName(selectedCategory.data.name);
      if (selectedCategory.data.thumbnailUrl && selectedCategory.data.thumbnailPublicId) {
        setEditThumbnail({
          url: selectedCategory.data.thumbnailUrl,
          publicId: selectedCategory.data.thumbnailPublicId
        });
      } else {
        setEditThumbnail(null);
      }
      setEditOpen(true);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !editName.trim()) return;
    updateMutation.mutate({ 
      id: value, 
      name: editName.trim(),
      thumbnailUrl: editThumbnail?.url || null,
      thumbnailPublicId: editThumbnail?.publicId || null
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    createMutation.mutate({
      name: createName.trim(),
      thumbnailUrl: createThumbnail?.url || null,
      thumbnailPublicId: createThumbnail?.publicId || null
    });
  };

  const handleDeleteSubmit = () => {
    if (!value) return;
    deleteMutation.mutate(value);
  };

  return (
    <>
      <div className="flex gap-2 w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {selectedCategory.data?.name ?? "Select category"}
              <ChevronsUpDown className="size-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[400px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search category..."
                value={search}
                onValueChange={setSearch}
              />

              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>

                <CommandGroup>
                  {items.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.id}
                      onSelect={() => {
                        onChange(category.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          value === category.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {category.name}
                    </CommandItem>
                  ))}
                </CommandGroup>

                <div ref={loaderRef} />

                {!exists && search.trim().length > 0 && (
                  <div className="border-t p-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setCreateName(search);
                        setCreateThumbnail(null);
                        setCreateOpen(true);
                        setOpen(false);
                      }}
                    >
                      <Plus className="mr-2 size-4" />
                      Create "{search}"
                    </Button>
                  </div>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {value && (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleEditClick}
              disabled={updateMutation.isPending || deleteMutation.isPending}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setDeleteOpen(true)}
              disabled={updateMutation.isPending || deleteMutation.isPending}
            >
              <Trash className="size-4 text-destructive" />
            </Button>
          </>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Category name"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Thumbnail</label>
              <ImageUpload
                value={createThumbnail}
                onChange={(val) => setCreateThumbnail(val as UploadedImage | null)}
                maxFiles={1}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!createName.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Category name"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Thumbnail</label>
              <ImageUpload
                value={editThumbnail}
                onChange={(val) => setEditThumbnail(val as UploadedImage | null)}
                maxFiles={1}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!editName.trim() || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteSubmit();
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}