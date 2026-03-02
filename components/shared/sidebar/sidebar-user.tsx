"use client";

import { useAuthStore } from "@/app/stores/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { apiRequest } from "@/lib/api/fetcher";
import { ChevronRight, ChevronUp, LogOut, Settings, User } from "lucide-react";
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
      window.location.replace("/login");
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full h-14 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300 group"
            >
              {/* --- AVATAR / INITIALS --- */}
              <div className="relative flex items-center justify-center shrink-0 w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs shadow-lg shadow-slate-200 group-hover:bg-primary transition-colors">
                {(user.name?.[0] || "A").toUpperCase()}
                {/* Status Online Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              {/* --- USER INFO --- */}
              <div className="flex flex-col items-start ml-3 overflow-hidden text-left">
                <span className="text-xs font-black text-slate-900 truncate uppercase tracking-tight w-full">
                  {user.name}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                  {user.role || "Administrator"}
                </span>
              </div>

              <ChevronUp className="ml-auto text-slate-300 group-hover:text-slate-900 transition-colors" size={16} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {/* --- DROPDOWN CONTENT --- */}
          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={12}
            className="w-56 p-2 rounded-[1.5rem] border-slate-100 shadow-2xl animate-in slide-in-from-left-2"
          >
            <div className="px-3 py-2 mb-2 border-b border-slate-50">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Account Control</p>
            </div>

            <DropdownMenuItem className="rounded-xl py-2.5 px-3 text-xs font-bold text-slate-600 focus:bg-slate-50 focus:text-slate-900 cursor-pointer flex items-center gap-2">
              <User size={14} className="text-slate-400" /> View Profile
            </DropdownMenuItem>

            <DropdownMenuItem className="rounded-xl py-2.5 px-3 text-xs font-bold text-slate-600 focus:bg-slate-50 focus:text-slate-900 cursor-pointer flex items-center gap-2">
              <Settings size={14} className="text-slate-400" /> Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-50 my-2" />

            <DropdownMenuItem
              className="rounded-xl py-2.5 px-3 text-xs font-black text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer flex items-center gap-2 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={14} /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
});
