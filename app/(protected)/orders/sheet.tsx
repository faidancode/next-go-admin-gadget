"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet as UISheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useMarkOrderDelivered,
  useOrderDetail,
  useUpdateOrder,
} from "@/hooks/use-order";
import { useOrderSheet } from "@/hooks/use-order-sheet";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { DefaultImage } from "@/components/shared/default-image";
import { OrderDetail, OrderItem } from "@/types/order";
import { StatusBadge } from "@/components/shared/status-badge";

// Helper formatting tetap sama
const formatCurrency = (value?: number | null) => {
  if (value == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0, // Biasanya IDR tidak pakai desimal di UI
  }).format(Number(value));
};

const formatDate = (value?: Date | string | null) => {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("id-ID");
};

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right wrap-break-word">{value ?? "-"}</span>
    </div>
  );
}

export function OrderSheet() {
  const { open, mode, orderId, defaults, close } = useOrderSheet();
  const { data, isFetching } = useOrderDetail(orderId, open);
  const updateOrder = useUpdateOrder();
  const markDelivered = useMarkOrderDelivered();

  const [receiptNo, setReceiptNo] = useState("");

  // Data detail sudah mengikuti OrderDetailResponse dari Go
  const detail = useMemo<OrderDetail | undefined>(() => data ?? undefined, [data]);

  const items = useMemo<OrderItem[]>(() => detail?.items ?? [], [detail]);

  useEffect(() => {
    setReceiptNo(detail?.receiptNo ?? defaults.receiptNo ?? "");
  }, [detail?.receiptNo, defaults.receiptNo, open]);

  // Logic Status
  const status = (detail?.status ?? defaults.status ?? "").toUpperCase();
  const isPaid = status === "PAID";
  const isProcessing = status === "PROCESSING";
  const isShipped = status === "SHIPPED";
  const allowActions = mode === "edit";

  // Handlers
  const handleMarkProcessing = async () => {
    if (!orderId) return;
    await updateOrder.mutateAsync({
      id: orderId,
      data: { nextStatus: "PROCESSING" as any },
    });
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    await updateOrder.mutateAsync({
      id: orderId,
      data: { nextStatus: "SHIPPED" as any, receiptNo: receiptNo || null },
    });
  };

  return (
    <UISheet open={open} onOpenChange={(o) => !o && close()}>
      <SheetContent className="w-full sm:max-w-xl p-4 sm:p-6 max-h-screen overflow-y-auto">
        <SheetHeader className="p-0">
          <SheetTitle className="text-xl">
            {mode === "edit" ? "Edit Order" : "Order Detail"}
          </SheetTitle>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-sm">
              {detail?.orderNumber ? `#${detail.orderNumber}` : ""}
            </span>
            <span className="text-xs text-muted-foreground">
              Placed at {formatDate(detail?.placedAt ?? defaults.createdAt)}
            </span>
          </div>
          {detail && (
            <StatusBadge status={detail?.status} />
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Section: Customer */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Customer Information</p>
            <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
              {/* Di Go kita pakai userId, jika ingin email/nama perlu join di Backend */}
              <InfoRow label="User ID" value={detail?.userId} />
              <InfoRow label="Note" value={detail?.note} />
            </div>
          </div>

          {/* Section: Items */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Ordered Items</p>
            <div className="rounded-lg border divide-y bg-muted/20">
              {items.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No items.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="p-3 flex gap-3 items-center">
                    <div className="relative h-14 w-12 shrink-0">
                      {item.productImageUrl ? (
                        <Image
                          src={item.productImageUrl}
                          alt={item.nameSnapshot}
                          fill
                          className="object-cover rounded border"
                        />
                      ) : (
                        <DefaultImage className="w-full h-full rounded-lg" logoOnly logoSize={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.nameSnapshot}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-right">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary Price */}
            <div className="space-y-1.5 px-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Price</span>
                <span className="font-bold text-primary">
                  {formatCurrency(detail?.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section: Shipping Action */}
          <div className="space-y-4">
            <p className="text-sm font-semibold">Order Management</p>

            {!allowActions && (
              <InfoRow label="Receipt Number" value={detail?.receiptNo} />
            )}

            {allowActions && (
              <div className="space-y-4">
                {isPaid && (
                  <Button
                    className="w-full"
                    onClick={handleMarkProcessing}
                    disabled={updateOrder.isPending}
                  >
                    Process Order
                  </Button>
                )}

                {isProcessing && (
                  <form onSubmit={handleSubmitReceipt} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="receiptNo">Input Receipt (Resi)</Label>
                      <Input
                        id="receiptNo"
                        value={receiptNo}
                        onChange={(e) => setReceiptNo(e.target.value)}
                        placeholder="e.g. JNE12345678"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!receiptNo || updateOrder.isPending}
                    >
                      Ship Order
                    </Button>
                  </form>
                )}

                {isShipped && (
                  <Button
                    variant="outline"
                    className="w-full border-emerald-500 text-emerald-600"
                    onClick={() => markDelivered.mutate(orderId!)}
                    disabled={markDelivered.isPending}
                  >
                    Mark as Delivered
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {isFetching && (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </SheetContent>
    </UISheet>
  );
}

export default OrderSheet;