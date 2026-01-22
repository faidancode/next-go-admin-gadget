import { CategoryFormValues } from "@/lib/validations/category-schema";
import { PaginationMeta } from "./api";

export type Category = CategoryFormValues & {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CategoryListResponse = {
  data: Category[];
  meta?: PaginationMeta;
};
