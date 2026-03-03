import { RecentOrder } from "@/types/dashboard";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<RecentOrder>[] = [
    {
        accessorKey: "orderNumber",
        header: "Order #",
        cell: ({ row }) => (
            <span className="font-black text-slate-900">
                {row.getValue("orderNumber")}
            </span>
        ),
    },
    {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-slate-700">{row.getValue("customer")}</span>
            </div>
        ),
    },
    {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalAmount"));
            const formatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(amount);
            return <span className="font-black text-primary">{formatted}</span>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
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
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            return (
                <span className="text-slate-400 font-bold uppercase tracking-tighter">
                    {row.getValue("date")}
                </span>
            );
        },
    },
];
