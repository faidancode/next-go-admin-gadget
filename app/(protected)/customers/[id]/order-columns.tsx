"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CustomerOrder } from "@/types/customer";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const formatCurrency = (value?: number | null) => {
    if (value == null) return "-";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(Number(value));
};

export const orderColumns: ColumnDef<CustomerOrder>[] = [
    {
        accessorKey: "orderNumber",
        header: "Order #",
        cell: ({ row }) => (
            <Link
                href={`/orders?status=${row.original.status}`}
                className="flex items-center gap-2 font-black text-slate-900 hover:text-primary transition-colors group"
            >
                <span>{row.original.orderNumber}</span>
                <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
        ),
    },
    {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ row }) => (
            <span className="font-black text-primary">{formatCurrency(row.original.totalAmount)}</span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge
                    className={cn(
                        "rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                        status === "PAID" || status === "DELIVERED" || status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-600 shadow-emerald-100"
                            : status === "PENDING"
                                ? "bg-amber-50 text-amber-600 shadow-amber-100"
                                : status === "CANCELLED"
                                    ? "bg-rose-50 text-rose-600 shadow-rose-100"
                                    : "bg-slate-50 text-slate-600 shadow-slate-100"
                    )}
                >
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
            <span className="text-slate-400 font-bold uppercase tracking-tighter">
                {new Date(row.original.createdAt).toLocaleDateString()}
            </span>
        ),
    },
];
