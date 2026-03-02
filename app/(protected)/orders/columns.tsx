"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type OrderRow } from "@/lib/api/order";
import { Eye, Pencil } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-200 text-gray-900 border-gray-400",
  PAID: "bg-blue-100 text-blue-800 border-blue-200",
  PROCESSING: "bg-amber-100 text-amber-800 border-amber-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const formatStatus = (status?: string | null) => {
  if (!status) return "-";
  return status.replaceAll("_", " ");
};

const formatCurrency = (value?: number | null) => {
  if (value == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
  }).format(Number(value));
};

export const columns = (
  onView: (order: OrderRow) => void,
  onEdit: (order: OrderRow) => void
): ColumnDef<OrderRow>[] => [
  {
    accessorKey: "orderNumber",
    header: "Order No.",
  },
  {
    accessorKey: "userName",
    header: "Customer",
    enableSorting: false,
    cell: ({ row }) => row.original.userName ?? "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const status = (row.original.status ?? "-").toString().toUpperCase();
      const className =
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700 border-slate-200";
      return (
        <Badge variant="outline" className={`uppercase ${className}`}>
          {formatStatus(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "totalCents",
    header: "Total",
    cell: ({ row }) => formatCurrency(row.original.totalCents),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt as string).toLocaleDateString()
        : "-",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(row.original)}
          className="text-blue-800"
        >
          <Eye size={14} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(row.original)}
        >
          <Pencil size={14} />
        </Button>
      </div>
    ),
  },
];
