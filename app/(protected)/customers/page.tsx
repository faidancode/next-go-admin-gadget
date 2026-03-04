"use client";

import { Input } from "@/components/ui/input";
import { useCustomers, useToggleCustomerStatus } from "@/hooks/use-customer";
import { useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { columns } from "./columns";
import AppHeader from "@/components/shared/app-header";
import SkeletonTable from "@/components/shared/table/skeleton-table";
import { DataTable } from "@/components/shared/table/data-table";
import { Search, Users as UsersIcon, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomerRow } from "@/types/customer";
import { cn } from "@/lib/utils";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("createdAt:desc");

  // Selection for Toggle confirmation
  const [customerToToggle, setCustomerToToggle] = useState<CustomerRow | null>(null);

  const { data, isLoading, error } = useCustomers(
    page,
    limit,
    debouncedSearch,
    sort
  );

  const toggleStatus = useToggleCustomerStatus();

  const totalPages = data?.meta?.totalPages ? Number(data.meta.totalPages) : 1;

  const handleToggleConfirm = () => {
    if (customerToToggle) {
      toggleStatus.mutate({
        id: customerToToggle.id,
        isActive: !customerToToggle.isActive
      }, {
        onSettled: () => setCustomerToToggle(null)
      });
    }
  };

  const tableColumns = useMemo(
    () => columns(
      (customer) => setCustomerToToggle(customer),
      toggleStatus.isPending
    ),
    [toggleStatus]
  );

  if (error) return <p className="p-8 text-rose-600 font-bold">Error: {(error as any).message}</p>;

  return (
    <>
      <AppHeader title="Customers" />
      <div className="container pt-6 space-y-6">
        {/* Search & Stats Bar */}
        <div className="flex flex-col gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 pl-2">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
              <UsersIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Records</p>
              <p className="text-sm font-bold text-slate-900">{data?.meta?.total ?? 0} Customers</p>
            </div>
          </div>

          <div className="relative group w-full sm:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
              size={16}
            />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 w-full rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-xs font-bold"
            />
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <SkeletonTable />
        ) : data?.data ? (
          <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20 bg-white transition-all duration-500">
            <DataTable
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
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30 rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-400">
            <Search size={48} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No customers found</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={!!customerToToggle} onOpenChange={(o) => !o && setCustomerToToggle(null)}>
        <AlertDialogContent className="rounded-[2rem] border-none p-8 gap-6">
          <AlertDialogHeader>
            <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
              <UsersIcon size={28} />
            </div>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">
              {customerToToggle?.isActive ? "Deactivate Customer?" : "Activate Customer?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              Are you sure you want to {customerToToggle?.isActive ? "deactivate" : "activate"} <b>{customerToToggle?.name}</b>?
              This will affect their ability to log in and place orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="h-12 rounded-xl border-slate-100 font-bold text-[10px] uppercase tracking-widest">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleConfirm}
              className={cn(
                "h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95",
                customerToToggle?.isActive ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
              )}
            >
              {toggleStatus.isPending ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
              Confirm Action
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
