import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// 1. Definisi Tipe Status
export type OrderStatus =
    | "PENDING"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED";

// 2. Mapping Gaya (Style) untuk setiap status
const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
    PENDING: {
        label: "Pending",
        className: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
    },
    PAID: {
        label: "Paid",
        className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
    },
    PROCESSING: {
        label: "Processing",
        className: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
    },
    SHIPPED: {
        label: "Shipped",
        className: "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
    },
    DELIVERED: {
        label: "Delivered",
        className: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    },
    COMPLETED: {
        label: "Completed",
        className: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
    },
    CANCELLED: {
        label: "Cancelled",
        className: "bg-red-100 text-red-700 border-red-200 hover:bg-red- red-100",
    },
};

interface StatusBadgeProps {
    status: string | OrderStatus;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    // Normalisasi status ke uppercase agar cocok dengan key
    const upperStatus = status?.toUpperCase() as OrderStatus;
    const config = STATUS_CONFIG[upperStatus] || {
        label: status,
        className: "bg-gray-100 text-gray-600",
    };

    return (
        <Badge
            variant="outline"
            className={cn("capitalize font-medium px-2.5 py-0.5", config.className, className)}
        >
            {config.label.toLowerCase()}
        </Badge>
    );
}