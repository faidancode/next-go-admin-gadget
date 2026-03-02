"use client";

import { create } from "zustand";
import { type OrderStatus } from "@/lib/api/order";

type Mode = "view" | "edit";

export type OrderSnapshot = {
  id: string;
  status?: OrderStatus | string | null;
  userName?: string | null;
  totalCents?: number | null;
  receiptNo?: string | null;
  createdAt?: Date | string | null;
};

interface OrderSheetState {
  open: boolean;
  mode: Mode;
  orderId?: string;
  defaults: Partial<OrderSnapshot>;
  openView: (payload: OrderSnapshot) => void;
  openEdit: (payload: OrderSnapshot) => void;
  close: () => void;
}

const emptyDefaults: Partial<OrderSnapshot> = {
  status: undefined,
  userName: "",
  totalCents: null,
  receiptNo: "",
  createdAt: undefined,
};

export const useOrderSheet = create<OrderSheetState>((set) => ({
  open: false,
  mode: "view",
  orderId: undefined,
  defaults: emptyDefaults,
  openView: (payload) =>
    set({
      open: true,
      mode: "view",
      orderId: payload.id,
      defaults: payload,
    }),
  openEdit: (payload) =>
    set({
      open: true,
      mode: "edit",
      orderId: payload.id,
      defaults: payload,
    }),
  close: () => set({ open: false }),
}));
