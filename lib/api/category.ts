import { ApiEnvelope, PaginationMeta } from "@/types/api";
import { apiRequest, buildQueryString, unwrapEnvelope } from "./fetcher";
import { Category, CategoryListResponse } from "@/types/category";
import { CategoryFormValues } from "../validations/category-schema";

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

export async function getCategoryById(
  id: string,
): Promise<ApiEnvelope<Category>> {
  return apiRequest<Category>(`/admin/categories/${id}`);
}

export async function createCategory(
  data: CategoryFormValues,
): Promise<ApiEnvelope<Category>> {
  return apiRequest<Category>("/admin/categories", data);
}

export async function updateCategory(
  id: string,
  data: CategoryFormValues,
): Promise<ApiEnvelope<Category>> {
  return apiRequest<Category>(`/admin/categories/${id}`, data, {
    method: "PATCH",
  });
}

export async function deleteCategory(id: string): Promise<ApiEnvelope<void>> {
  return apiRequest<void>(`/admin/categories/${id}`, undefined, {
    method: "DELETE",
  });
}
