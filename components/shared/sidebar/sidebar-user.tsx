"use client";

import { useAuthStore } from "@/app/stores/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSubButton
} from "@/components/ui/sidebar";
import { apiRequest } from "@/lib/api/fetcher";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export const SidebarUser = React.memo(() => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  async function handleLogout() {
    try {
      await apiRequest<{ success: boolean }>(
        "/auth/logout",
        {},
        { method: "POST" },
      );
    } catch {
      // ignore, tetap logout client
    } finally {
      useAuthStore.getState().logout();
      localStorage.removeItem("auth-storage");
      sessionStorage.removeItem("auth-validated");
      router.replace("/login");
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuSubButton className="p-2">
              <div className="bg-primary text-secondary font-semibold rounded-lg w-8 h-8 flex items-center justify-center mr-3">
                {(user.name?.[0] || "A").toUpperCase()}
              </div>
              <p className="font-semibold">{user.name}</p>
              <ChevronRight className="ml-auto" />
            </SidebarMenuSubButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right">
            <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
});
