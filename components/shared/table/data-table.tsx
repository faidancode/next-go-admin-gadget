"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown, SearchX } from "lucide-react";
import { DataTablePagination } from "./data-table-pagination";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number; // Add page prop
  setPage: (page: number) => void;
  pageSize: number; // Add pageSize prop
  setPageSize: (pageSize: number) => void;
  totalPages: number; // Add page prop
  sort: string;
  setSort: (sort: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  page, // Destructure page
  setPage, // Destructure setPage
  pageSize, // Destructure Limit
  setPageSize, // Destructure setPageSize
  totalPages,
  sort,
  setSort,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: true,
    state: {
      sorting: sort
        ? [
          {
            id: sort.split(":")[0],
            desc: sort.split(":")[1] === "desc",
          },
        ]
        : [],
    },
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(table.getState().sorting)
          : updater;

      if (!next.length) {
        setSort("createdAt:desc");
        return;
      }

      const s = next[0];
      setSort(`${s.id}:${s.desc ? "desc" : "asc"}`);
      setPage(1);
    },
  });
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden transition-all duration-300">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-100">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-12 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors",
                      header.column.getCanSort() ? "cursor-pointer hover:text-primary" : "cursor-default"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <div className="flex flex-col">
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUp size={12} className="text-primary" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown size={12} className="text-primary" />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-20" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group border-slate-50 hover:bg-slate-50/50 transition-colors"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 text-xs font-medium text-slate-600">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <SearchX size={32} strokeWidth={1.5} />
                    <p className="text-xs font-bold uppercase tracking-widest">No matching records found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalPages={totalPages}
      />
    </div>
  );
}
