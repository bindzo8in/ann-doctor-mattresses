"use client";

import { ChevronsUpDown, Check, Plus } from "lucide-react";

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

import { cn } from "@/lib/utils";

import {
  createCategory,
  getCategories,
  getCategory,
} from "@/lib/helpers/category";

import { useDebounce } from "@/hooks/use-debounce";

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

  const debouncedSearch =
    useDebounce(search);

  const queryClient = useQueryClient();

  const loaderRef =
    useRef<HTMLDivElement>(null);

  const selectedCategory = useQuery({
    queryKey: ["category", value],
    queryFn: () => getCategory(value!),
    enabled: !!value,
  });

  const categories = useInfiniteQuery({
    queryKey: [
      "categories",
      debouncedSearch,
    ],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      getCategories({
        search: debouncedSearch,
        cursor: pageParam ?? undefined,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor,
  });

  const items = useMemo(
    () =>
      categories.data?.pages.flatMap(
        (page) => page.items
      ) ?? [],
    [categories.data]
  );

  useEffect(() => {
    const el = loaderRef.current;

    if (!el) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            categories.hasNextPage &&
            !categories.isFetchingNextPage
          ) {
            categories.fetchNextPage();
          }
        }
      );

    observer.observe(el);

    return () => observer.disconnect();
  }, [categories]);

  const createMutation = useMutation({
    mutationFn: createCategory,

    onSuccess(category) {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      queryClient.setQueryData(
        ["category", category.id],
        category
      );

      onChange(category.id);

      setOpen(false);
    },
  });

  const exists = items.some(
    (x) =>
      x.name.toLowerCase() ===
      search.toLowerCase()
  );

    return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selectedCategory.data?.name ??
            "Select category"}

          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[400px] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search category..."
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            <CommandEmpty>
              No category found.
            </CommandEmpty>

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
                      value === category.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />

                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>

            <div ref={loaderRef} />

            {!exists &&
              search.trim().length > 0 && (
                <div className="border-t p-2">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      createMutation.mutate(
                        search
                      )
                    }
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
  );
}