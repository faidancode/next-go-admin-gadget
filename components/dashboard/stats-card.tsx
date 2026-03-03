import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isUp: boolean;
    };
    className?: string;
    iconClassName?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    iconClassName,
}: StatsCardProps) {
    return (
        <Card className={cn("relative overflow-hidden group transition-all duration-300 hover:shadow-md border-slate-100", className)}>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {title}
                        </p>
                        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                            {value}
                        </h3>
                    </div>
                    <div className={cn(
                        "p-3 rounded-2xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-primary/10 group-hover:text-primary",
                        iconClassName
                    )}>
                        <Icon size={20} strokeWidth={2.5} />
                    </div>
                </div>

                {(description || trend) && (
                    <div className="mt-4 flex items-center gap-2">
                        {trend && (
                            <span className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded-full",
                                trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                                {trend.isUp ? "+" : "-"}{trend.value}%
                            </span>
                        )}
                        {description && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-slate-900 group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <Icon size={100} strokeWidth={1} />
            </div>
        </Card>
    );
}
