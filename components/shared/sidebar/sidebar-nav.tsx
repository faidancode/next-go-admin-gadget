"use client";

import { useAuthStore } from "@/app/stores/auth";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BadgeCheck,
  ChartArea,
  LayoutGrid,
  ReceiptText,
  ShieldUser,
  TabletSmartphone,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Config */
const SIDEBAR_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: ChartArea },
  { title: "Categories", url: "/categories", icon: LayoutGrid },
  { title: "Brands", url: "/brands", icon: BadgeCheck },
  { title: "Products", url: "/products", icon: TabletSmartphone },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Orders", url: "/orders", icon: ReceiptText },
  {
    title: "Admin",
    url: "/admin",
    icon: ShieldUser,
    roles: ["SUPERADMIN"],
  },
];

/* ------------------------------------------------------------------ */

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (url: string) =>
    pathname === url || (pathname.startsWith(url) && url !== "/");

  const role = useAuthStore((s) => s.user?.role);

  const visibleItems = useMemo(() => {
    return SIDEBAR_ITEMS.filter((item) => {
      if (!item.roles) return true;
      return role === "SUPERADMIN";
    });
  }, [role]);

  return (
    <SidebarMenu className="gap-1.5">
      {visibleItems.map((item) => {
        const active = isActive(item.url);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              className={cn(
                "relative h-12 px-4 rounded-xl transition-all duration-300 group",
                active
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                  : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
              )}
            >
              <a href={item.url} className="flex items-center gap-3 w-full">
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  active ? "bg-white/10 text-primary" : "text-slate-400 group-hover:text-slate-900"
                )}>
                  <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                </div>

                <span className={cn(
                  "text-sm font-bold tracking-tight transition-all",
                  active ? "translate-x-0.5" : "group-hover:translate-x-0.5"
                )}>
                  {item.title}
                </span>

                {active && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
