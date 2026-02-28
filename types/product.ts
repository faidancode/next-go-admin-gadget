import { PaginationMeta } from "./api";

export type Product = {
  id: string;
  categoryId: string;
  categoryName: string;
  brandId?: string;
  brandName?: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ProductListResponse = {
  data: Product[];
  meta?: PaginationMeta;
};
