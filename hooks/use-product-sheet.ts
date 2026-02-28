"use client";

import { ProductFormValues } from "@/lib/validations/product-schema";
import { create } from "zustand";

type Mode = "create" | "edit";

interface ProductEditPayload {
  id: string;
  categoryId: string;
  brandId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  imageUrl?: string;
  isActive?: boolean;
}

interface ProductSheetState {
  open: boolean;
  mode: Mode;
  editingId?: string;
  defaultValues: Partial<ProductFormValues>;
  openCreate: () => void;
  openEdit: (payload: ProductEditPayload) => void;
  close: () => void;
}

const initialValues: Partial<ProductFormValues> = {
  categoryId: "",
  brandId: "",
  name: "",
  description: "",
  price: 0,
  stock: 0,
  sku: "",
  imageUrl: "",
  isActive: true,
};

export const useProductSheet = create<ProductSheetState>((set) => ({
  open: false,
  mode: "create",
  editingId: undefined,
  defaultValues: initialValues,
  openCreate: () =>
    set({
      open: true,
      mode: "create",
      editingId: undefined,
      defaultValues: initialValues,
    }),
  openEdit: (payload) =>
    set({
      open: true,
      mode: "edit",
      editingId: payload.id,
      defaultValues: {
        categoryId: payload.categoryId,
        brandId: payload.brandId,
        name: payload.name,
        description: payload.description ?? "",
        price: payload.price,
        stock: payload.stock,
        sku: payload.sku ?? "",
        imageUrl: payload.imageUrl ?? "",
        isActive: payload.isActive ?? true,
      },
    }),
  close: () => set({ open: false }),
}));
