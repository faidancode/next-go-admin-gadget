import { BrandFormValues } from "@/lib/validations/brand-schema";
import { PaginationMeta } from "./api";

export type Brand = BrandFormValues & {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BrandListResponse = {
  data: Brand[];
  meta?: PaginationMeta;
};
