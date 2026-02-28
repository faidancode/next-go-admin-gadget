import { PaginationMeta } from "@/types/api";
import { Product, ProductListResponse } from "@/types/product";
import { apiRequest, buildQueryString, unwrapEnvelope } from "./fetcher";
import { ProductFormValues } from "../validations/product-schema";

type ProductPayloadWithFile = ProductFormValues & {
  imageFile?: File | Blob | FileList | null;
};

function normalizeSort(sort: string) {
  const [rawSortBy, rawSortDir] = sort.split(":");

  const sortByMap: Record<string, string> = {
    createdAt: "created_at",
    updatedAt: "updated_at",
    categoryName: "category_name",
    isActive: "is_active",
  };

  const sortBy = sortByMap[rawSortBy] ?? rawSortBy ?? "created_at";
  const sortDir = rawSortDir === "asc" ? "asc" : "desc";

  return { sortBy, sortDir };
}

function buildProductFormData(
  data: ProductPayloadWithFile,
  mode: "create" | "update",
): FormData {
  const formData = new FormData();

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    if (value instanceof Blob) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  };

  append("categoryId", data.categoryId);
  append("brandId", data.brandId);
  append("name", data.name);
  append("description", data.description);
  append("price", data.price);
  append("stock", data.stock);
  append("sku", data.sku);

  if (typeof data.isActive === "boolean") {
    append("isActive", data.isActive);
  }

  const image =
    data.imageFile ??
    (data as ProductFormValues & { imageUrl?: unknown }).imageUrl;

  if (image instanceof FileList && image.length > 0) {
    append("image", image[0]);
  } else if (image instanceof Blob) {
    append("image", image);
  } else if (typeof image === "string" && image.trim()) {
    append("imageUrl", image);
  }

  return formData;
}

export async function getProducts(
  page: number,
  pageSize: number,
  search: string,
  sort: string,
): Promise<ProductListResponse> {
  const { sortBy, sortDir } = normalizeSort(sort);
  const query = buildQueryString({
    page,
    limit: pageSize,
    search,
    sort_by: sortBy,
    sort_dir: sortDir,
  });
  const path = query ? `/admin/products?${query}` : "/admin/products";

  const envelope = await apiRequest<Product[]>(path);
  const data = unwrapEnvelope(envelope, "Failed to fetch products");

  return {
    data,
    meta: envelope.meta as PaginationMeta,
  };
}

export async function getProductById(id: string): Promise<Product> {
  const envelope = await apiRequest<Product>(`/admin/products/${id}`);
  return unwrapEnvelope(envelope, "Failed to fetch product detail");
}

export async function createProduct(
  data: ProductPayloadWithFile,
): Promise<Product> {
  const formData = buildProductFormData(data, "create");
  const envelope = await apiRequest<Product>("/admin/products", formData);
  return unwrapEnvelope(envelope, "Failed to create product");
}

export async function updateProduct(
  id: string,
  data: ProductPayloadWithFile,
): Promise<Product> {
  const formData = buildProductFormData(data, "update");
  const envelope = await apiRequest<Product>(
    `/admin/products/${id}`,
    formData,
    {
      method: "PATCH",
    },
  );

  return unwrapEnvelope(envelope, "Failed to update product");
}

export async function deleteProduct(id: string): Promise<void> {
  const envelope = await apiRequest<void>(`/admin/products/${id}`, undefined, {
    method: "DELETE",
  });

  unwrapEnvelope(envelope, "Failed to delete product");
}
