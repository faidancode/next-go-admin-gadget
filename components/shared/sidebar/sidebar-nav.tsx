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
    <SidebarMenu>
      {visibleItems.map((item) => {
        const active = isActive(item.url);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              className={`my-1 p-5 transition-all border-l-4  rounded-none ${
                active
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-primary-50 border-white text-gray-600"
              }`}
            >
              <a href={item.url} className="flex items-center gap-3">
                <item.icon
                  size={22}
                  className={active ? "text-primary" : "text-gray-600"}
                />
                <span
                  className={`text-base font-semibold ${
                    active ? "text-primary" : "text-gray-500"
                  }`}
                >
                  {item.title}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
