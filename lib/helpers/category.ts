export interface Category {
  id: string;
  name: string;
  slug: string;
}

export async function getCategories({
  search,
  cursor,
}: {
  search: string;
  cursor?: string;
}) {
  const params = new URLSearchParams();

  params.set("search", search);

  if (cursor) {
    params.set("cursor", cursor);
  }

  const res = await fetch(
    `/api/categories?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("Failed");
  }

  return res.json();
}

export async function createCategory(
  name: string
): Promise<Category> {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error("Failed");
  }

  return res.json();
}

export async function getCategory(
  id: string
): Promise<Category> {
  const res = await fetch(`/api/categories/${id}`);

  if (!res.ok) {
    throw new Error("Failed");
  }

  return res.json();
}