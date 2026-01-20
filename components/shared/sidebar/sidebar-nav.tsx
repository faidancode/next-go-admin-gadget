"use client";

import { useAuthStore } from "@/app/stores/auth";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  BookOpen,
  CreditCard,
  Grid2X2,
  LayoutDashboard,
  PenTool,
  ShieldUser,
  Users,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

/* ------------------------------------------------------------------ */
/* Config */
const SIDEBAR_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Categories", url: "/categories", icon: Grid2X2 },
  { title: "Authors", url: "/authors", icon: PenTool },
  { title: "Books", url: "/books", icon: BookOpen },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Orders", url: "/orders", icon: CreditCard },
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
              className={`my-1 p-5 transition-all rounded-none ${
                active
                  ? "bg-secondary/5 border-l-4 border-secondary"
                  : "hover:bg-primary-50 text-gray-700"
              }`}
            >
              <a href={item.url} className="flex items-center gap-3">
                <item.icon
                  size={22}
                  className={active ? "text-secondary" : "text-gray-700"}
                />
                <span
                  className={`text-base font-semibold ${
                    active ? "text-secondary" : "text-gray-600"
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
