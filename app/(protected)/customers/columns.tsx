"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Power, PowerOff } from "lucide-react";
import { CustomerRow } from "@/types/customer";
import { cn, formatDate } from "@/lib/utils";
import Link from "next/link";

export const columns = (
    onToggleStatus: (customer: CustomerRow) => void,
    isToggling: boolean
): ColumnDef<CustomerRow>[] => [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{row.original.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{row.original.id}</span>
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <span className="font-medium">{row.original.email}</span>,
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <span className="font-medium italic text-slate-400">{row.original.phone || "-"}</span>,
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => {
                const active = row.original.isActive;
                return (
                    <Badge
                        className={cn(
                            "rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                            active
                                ? "bg-emerald-50 text-emerald-600 shadow-emerald-100"
                                : "bg-rose-50 text-rose-600 shadow-rose-100"
                        )}
                    >
                        {active ? "Active" : "Inactive"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Joined",
            cell: ({ row }) => (
                <span className="text-slate-400 font-bold uppercase tracking-tighter">
                    {formatDate(row.original.createdAt)}
                </span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Link href={`/customers/${row.original.id}`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"
                        >
                            <Eye size={16} />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={isToggling}
                        onClick={(e) => {
                            e.preventDefault();
                            onToggleStatus(row.original);
                        }}
                        className={cn(
                            "h-8 w-8 rounded-lg",
                            row.original.isActive
                                ? "text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                                : "text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"
                        )}
                    >
                        {row.original.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                    </Button>
                </div>
            ),
        },
    ];
