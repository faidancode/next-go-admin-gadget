// src/lib/api/brand.ts
import { ApiEnvelope, PaginationMeta } from "@/types/api";
import { apiRequest, buildQueryString, unwrapEnvelope } from "./fetcher";
import { BrandFormValues } from "../validations/brand-schema";
import { Brand, BrandListResponse } from "@/types/brand";

/* =======================
   Types
======================= */

type BrandPayloadWithFile = BrandFormValues & {
  imageFile?: File | Blob | FileList | null;
};

/* =======================
   Helpers
======================= */

function buildBrandFormData(data: BrandPayloadWithFile): FormData {
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
    (data as BrandFormValues & { imageUrl?: unknown }).imageUrl;

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

export async function getBrands(
  page: number,
  pageSize: number,
  search: string,
  sort: string,
): Promise<BrandListResponse> {
  const query = buildQueryString({ page, pageSize, search, sort });
  const path = query ? `/admin/brands?${query}` : "/admin/brands";

  const envelope = await apiRequest<Brand[]>(path);
  const data = unwrapEnvelope(envelope, "Failed to fetch brands");

  return {
    data,
    meta: envelope.meta as PaginationMeta,
  };
}

export async function getBrandById(id: string): Promise<Brand> {
  const envelope = await apiRequest<Brand>(`/admin/brands/${id}`);
  return unwrapEnvelope(envelope, "Failed to fetch brand detail");
}

/**
 * Create brand
 * → selalu multipart (karena create biasanya upload image)
 */
export async function createBrand(data: BrandPayloadWithFile): Promise<Brand> {
  const formData = buildBrandFormData(data);
  const envelope = await apiRequest<Brand>("/admin/brands", formData);
  return unwrapEnvelope(envelope, "Failed to create brand");
}

/**
 * Update brand
 * → multipart ONLY jika ada file
 */
export async function updateBrand(
  id: string,
  data: BrandPayloadWithFile,
): Promise<Brand> {
  const file = data.imageFile;
  const hasFile =
    file instanceof File ||
    file instanceof Blob ||
    (file instanceof FileList && file.length > 0);

  const envelope = hasFile
    ? await apiRequest<Brand>(`/admin/brands/${id}`, buildBrandFormData(data), {
        method: "PATCH",
      })
    : await apiRequest<Brand>(`/admin/brands/${id}`, data, { method: "PATCH" });

  return unwrapEnvelope(envelope, "Failed to update brand");
}

export async function deleteBrand(id: string): Promise<void> {
  const envelope = await apiRequest<void>(`/admin/brands/${id}`, undefined, {
    method: "DELETE",
  });

  unwrapEnvelope(envelope, "Failed to delete brand");
}
