"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Address } from "@/types/customer";

export const addressColumns: ColumnDef<Address>[] = [
    {
        accessorKey: "addressName",
        header: "Label",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{row.original.addressName}</span>
                {row.original.isMain && (
                    <Badge className="bg-primary/10 text-primary text-[8px] font-black uppercase border-none h-4">Main</Badge>
                )}
            </div>
        ),
    },
    {
        accessorKey: "receiverName",
        header: "Recipient",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-slate-700">{row.original.receiverName}</span>
                <span className="text-[10px] text-slate-400 font-medium">{row.original.phone}</span>
            </div>
        ),
    },
    {
        accessorKey: "fullAddress",
        header: "Address",
        cell: ({ row }) => (
            <span className="text-xs text-slate-500 font-medium line-clamp-1 max-w-[300px]" title={row.original.fullAddress}>
                {row.original.fullAddress}
            </span>
        ),
    },
];
