import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  setLimit?: (limit: number) => void;
  limit: number;
  setPage?: (limit: number) => void;
  page: number;
  totalPages: number;
}

export function DataTablePagination<TData>({
  table,
  limit,
  setLimit,
  page,
  setPage,
  totalPages,
}: DataTablePaginationProps<TData> & {
  setLimit?: (newLimit: number) => void;
  setPage?: (newPage: number) => void;
}) {
  const canPreviousPage = page > 1 ? true : false;
  const canNextPage = page < totalPages ? true : false;
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Show</p>
          <Select
            value={String(limit)}
            onValueChange={(v) => {
              setLimit?.(Number(v));
              setPage?.(1);
            }}
          >
            <SelectTrigger className="h-8 w-[70px] rounded-lg border-slate-200 bg-white font-bold text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              {[10, 25, 50].map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs font-bold">{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hidden sm:block">
          Total {totalPages} Pages
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30"
            onClick={() => setPage?.(1)}
            disabled={page === 1}
          >
            <ChevronsLeft size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30"
            onClick={() => setPage?.(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft size={14} />
          </Button>

          <div className="flex items-center px-3 gap-1">
            <input
              type="number"
              value={page}
              onChange={(e) => setPage?.(Number(e.target.value))}
              className="w-8 text-center text-xs font-black text-primary focus:outline-none"
            />
            <span className="text-[10px] font-black text-slate-300 uppercase">/ {totalPages}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30"
            onClick={() => setPage?.(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-primary disabled:opacity-30"
            onClick={() => setPage?.(totalPages)}
            disabled={page >= totalPages}
          >
            <ChevronsRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
