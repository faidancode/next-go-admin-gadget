"use client";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/hooks/use-order";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { columns } from "./columns";
import { useOrderSheet } from "@/hooks/use-order-sheet";
import OrderSheet from "./sheet";
import AppHeader from "@/components/shared/app-header";
import SkeletonTable from "@/components/shared/table/skeleton-table";
import { DataTable } from "@/components/shared/table/data-table";
import { OrderRow } from "@/types/order";
import { cn } from "@/lib/utils";
import { Inbox, Search } from "lucide-react";

const STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialStatus = useMemo(() => {
    const status = searchParams.get("status");
    return status ? status.toUpperCase() : "PAID";
  }, [searchParams]);

  const [status, setStatus] = useState<string>(initialStatus);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("placedAt:desc");


  const { data, isLoading, error } = useOrders(
    status,
    page,
    limit,
    debouncedSearch,
    sort
  );
  const { openView, openEdit } = useOrderSheet();

  const totalPages = data?.meta?.totalPages ? Number(data.meta.totalPages) : 1;
  console.log({ limit });
  console.log({ totalPages });
  const handleStatusChange = (nextStatus: string) => {
    setStatus(nextStatus);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", nextStatus);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleView = useCallback(
    (order: OrderRow) =>
      openView({
        id: order.id,
        status: order.status,
        totalCents: order.totalPrice ?? null,
        receiptNo: (order as { receiptNo?: string }).receiptNo,
      }),
    [openView]
  );

  const handleEdit = useCallback(
    (order: OrderRow) =>
      openEdit({
        id: order.id,
        status: order.status,
        totalCents: order.totalPrice ?? null,
        receiptNo: (order as { receiptNo?: string }).receiptNo,
        // createdAt: order.createdAt,
      }),
    [openEdit]
  );

  const tableColumns = useMemo(
    () => columns(handleView, handleEdit),
    [handleEdit, handleView]
  );

  if (error) return <p className="p-4 text-red-600">Error: {error.message}</p>;

  return (
    <>
      <AppHeader title="Orders" />
      <div className="container pt-2 space-y-4 mt-4">
        <Tabs
          value={status}
          onValueChange={handleStatusChange}
          className="w-full space-y-8"
        >
          {/* Tabs List dengan Glassmorphism style */}
          <div className="flex flex-col gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            {/* Container Tabs dengan Horizontal Scroll di Mobile */}
            <div className="w-full overflow-x-auto no-scrollbar sm:w-auto">
              <TabsList className="flex bg-transparent h-auto p-0 gap-1 justify-start min-w-max">
                {STATUSES.map((st) => (
                  <TabsTrigger
                    key={st}
                    value={st}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      "data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200",
                      "data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-slate-600 data-[state=inactive]:hover:bg-slate-50"
                    )}
                  >
                    {st}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Search Input - Full width di mobile, fixed width di desktop */}
            <div className="relative group w-full sm:w-64">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                size={16}
              />
              <Input
                type="text"
                placeholder="Find orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-10 w-full rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-xs font-bold"
              />
            </div>
          </div>

          <TabsContent value={status} className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300">
            {isLoading ? (
              <SkeletonTable />
            ) : data?.data ? (
              <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20 bg-white">
                <DataTable
                  key={`${status}-${page}-${limit}`}
                  columns={tableColumns}
                  data={data.data}
                  page={page}
                  setPage={setPage}
                  limit={limit}
                  setLimit={setLimit}
                  totalPages={totalPages}
                  sort={sort}
                  setSort={setSort}
                />
              </div>
            ) : (
              /* Empty State jika tidak ada data */
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400">
                <Inbox size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No {status} orders found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <OrderSheet />
      </div>
    </>
  );
}

export default OrdersPage;
