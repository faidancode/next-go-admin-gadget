// src/lib/api/category.ts
import { ApiEnvelope, PaginationMeta } from "@/types/api";
import { apiRequest, buildQueryString, unwrapEnvelope } from "./fetcher";
import { CategoryFormValues } from "../validations/category-schema";
import { Category, CategoryListResponse } from "@/types/category";

/* =======================
   Types
======================= */

type CategoryPayloadWithFile = CategoryFormValues & {
  imageFile?: File | Blob | FileList | null;
};

/* =======================
   Helpers
======================= */

function buildCategoryFormData(data: CategoryPayloadWithFile): FormData {
  const formData = new FormData();

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    if (value instanceof Blob) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  };

  append("name", data.name);

  const image =
    data.imageFile ??
    (data as CategoryFormValues & { imageUrl?: unknown }).imageUrl;

  if (image instanceof FileList && image.length > 0) {
    append("image", image[0]);
  } else if (image instanceof Blob) {
    append("image", image);
  } else if (typeof image === "string" && image.trim()) {
    append("imageUrl", image);
  }

  return formData;
}

/* =======================
   API Functions
======================= */

export async function getCategories(
  page: number,
  pageSize: number,
  search: string,
  sort: string,
): Promise<CategoryListResponse> {
  const query = buildQueryString({ page, pageSize, search, sort });
  const path = query ? `/admin/categories?${query}` : "/admin/categories";

  const envelope = await apiRequest<Category[]>(path);
  const data = unwrapEnvelope(envelope, "Failed to fetch categories");

  return {
    data,
    meta: envelope.meta as PaginationMeta,
  };
}

export async function getCategoryById(id: string): Promise<Category> {
  const envelope = await apiRequest<Category>(`/admin/categories/${id}`);
  return unwrapEnvelope(envelope, "Failed to fetch category detail");
}

/**
 * Create category
 * → selalu multipart (karena create biasanya upload image)
 */
export async function createCategory(
  data: CategoryPayloadWithFile,
): Promise<Category> {
  const formData = buildCategoryFormData(data);
  const envelope = await apiRequest<Category>("/admin/categories", formData);
  return unwrapEnvelope(envelope, "Failed to create category");
}

/**
 * Update category
 * → multipart ONLY jika ada file
 */
export async function updateCategory(
  id: string,
  data: CategoryPayloadWithFile,
): Promise<Category> {
  const file = data.imageFile;
  const hasFile =
    file instanceof File ||
    file instanceof Blob ||
    (file instanceof FileList && file.length > 0);

  const envelope = hasFile
    ? await apiRequest<Category>(
        `/admin/categories/${id}`,
        buildCategoryFormData(data),
        {
          method: "PATCH",
        },
      )
    : await apiRequest<Category>(`/admin/categories/${id}`, data, {
        method: "PATCH",
      });

  return unwrapEnvelope(envelope, "Failed to update category");
}

export async function deleteCategory(id: string): Promise<void> {
  const envelope = await apiRequest<void>(
    `/admin/categories/${id}`,
    undefined,
    {
      method: "DELETE",
    },
  );

  unwrapEnvelope(envelope, "Failed to delete category");
}
