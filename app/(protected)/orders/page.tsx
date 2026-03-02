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
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("placedAt:desc");

  const { data, isLoading, error } = useOrders(
    status,
    page,
    pageSize,
    debouncedSearch,
    sort
  );
  const { openView, openEdit } = useOrderSheet();

  const totalPages = data?.meta?.totalPages ? Number(data.meta.totalPages) : 1;

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
          className="hover:cursor-pointer"
        >
          <TabsList className="bg-white">
            {STATUSES.map((st) => (
              <TabsTrigger
                key={st}
                value={st}
                className="data-[state=active]:bg-primary data-[state=active]:text-secondary data-[state=active]:font-semibold"
              >
                {st}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={status}>
            <div className="flex justify-between items-center mb-4 mt-6">
              <Input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white p-2 border rounded-lg w-48"
              />
            </div>
            {isLoading ? (
              <SkeletonTable />
            ) : data?.data ? (
              <div>
                <DataTable
                  key={`${status}-${page}-${pageSize}`}
                  columns={tableColumns}
                  data={data.data}
                  page={page}
                  setPage={setPage}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  totalPages={totalPages}
                  sort={sort}
                  setSort={setSort}
                />
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
        <OrderSheet />
      </div>
    </>
  );
}

export default OrdersPage;
