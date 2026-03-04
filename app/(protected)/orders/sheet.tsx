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
import { Box, ImageIcon, Loader2, Package, Settings2, StickyNote, User, Zap } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
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
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col h-full border-none rounded-l-[2rem]">
        {/* Header Section dengan Glassmorphism style */}
        <SheetHeader className="p-8 pb-6 border-b border-slate-50 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-black tracking-tighter uppercase text-slate-900">
                {mode === "edit" ? "Edit Order" : "Order Detail"}
              </SheetTitle>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg text-slate-600">
                  {detail?.orderNumber ? `#${detail.orderNumber}` : ""}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {formatDate(detail?.placedAt ?? defaults.createdAt)}
                </span>
              </div>
            </div>
            {detail && <StatusBadge status={detail?.status} className="rounded-xl px-4 py-2 font-black uppercase text-[9px] tracking-[0.15em]" />}
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">

          {/* Section: Customer & Shipping */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
              <User size={14} /> Customer & Shipping Info
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-black text-slate-900">{detail?.address?.recipientName || "Unknown User"}</p>
                    <p className="text-xs font-bold text-slate-400">{detail?.address?.recipientPhone || detail?.userId}</p>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[9px] font-black uppercase text-slate-400">
                    {detail?.address?.label || "Home"}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-200/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Delivery Address</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {detail?.address?.street}, {detail?.address?.subdistrict}, {detail?.address?.district}<br />
                    {detail?.address?.city}, {detail?.address?.province} - {detail?.address?.postalCode}
                  </p>
                </div>

                {detail?.note && (
                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50 flex gap-2">
                    <StickyNote size={14} className="text-amber-500 shrink-0" />
                    <p className="text-[11px] text-amber-700 italic font-medium">"{detail.note}"</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section: Items */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                <Package size={14} /> Ordered Items
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{items.length} Items</span>
            </div>

            <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
              {items.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <Box className="mx-auto text-slate-200" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No items in this order</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 flex gap-4 items-center hover:bg-slate-50/50 transition-colors">
                      <div className="relative h-16 w-14 shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                        {item.productImageUrl ? (
                          <Image src={item.productImageUrl} alt={item.nameSnapshot} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 uppercase truncate leading-tight mb-1">{item.nameSnapshot}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {item.quantity} Unit <span className="mx-1">•</span> {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="text-xs font-black text-slate-900">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Footer inside Items Box */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grand Total</span>
                <span className="text-lg font-black text-primary tracking-tighter">
                  {formatCurrency(detail?.totalPrice)}
                </span>
              </div>
            </div>
          </section>

          {/* Section: Order Management */}
          <section className="space-y-4 pt-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
              <Settings2 size={14} /> Management
            </h3>

            <div className="rounded-2xl border-2 border-dashed border-slate-200/80 p-6 space-y-6">
              {!allowActions && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tracking Number</p>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-700">
                    {detail?.receiptNo || "NOT_SHIPPED_YET"}
                  </div>
                </div>
              )}

              {allowActions && (
                <div className="space-y-4">
                  {isPaid && (
                    <Button
                      className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
                      onClick={handleMarkProcessing}
                      disabled={updateOrder.isPending}
                    >
                      {updateOrder.isPending ? <Loader2 className="animate-spin mr-2" size={14} /> : <Zap size={14} className="mr-2" />}
                      Confirm & Process Order
                    </Button>
                  )}

                  {isProcessing && (
                    <form onSubmit={handleSubmitReceipt} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="receiptNo" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Shipping Receipt (Resi)</Label>
                        <Input
                          id="receiptNo"
                          value={receiptNo}
                          onChange={(e) => setReceiptNo(e.target.value)}
                          placeholder="E.g: JNE123456789"
                          className="h-12 rounded-xl border-slate-200 focus:ring-4 focus:ring-primary/5 font-bold uppercase placeholder:text-slate-300"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-primary font-black uppercase text-[10px] tracking-widest"
                        disabled={!receiptNo || updateOrder.isPending}
                      >
                        Dispatch & Ship Order
                      </Button>
                    </form>
                  )}

                  {isShipped && (
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl border-2 border-emerald-500 text-emerald-600 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-50 transition-all"
                      onClick={() => markDelivered.mutate(orderId!)}
                      disabled={markDelivered.isPending}
                    >
                      Mark as Successfully Delivered
                    </Button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Loading Overlay */}
        {isFetching && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
            <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs font-black uppercase tracking-widest">Refreshing Data...</span>
            </div>
          </div>
        )}
      </SheetContent>
    </UISheet>
  );
}

export default OrderSheet;