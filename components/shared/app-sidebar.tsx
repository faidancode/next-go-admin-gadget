"use client";

import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar/sidebar-nav";
import { SidebarUser } from "./sidebar/sidebar-user";

/* ------------------------------------------------------------------ */

export function AppSidebar() {
  // Tampilkan sidebar
  return (
    <Sidebar className="border-r border-slate-100 shadow-xl shadow-slate-200/20">
      <SidebarHeader className="bg-white px-6 py-8">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
              <Image src="/logo.svg" alt="logo" height={24} width={24} className="brightness-0 invert" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-slate-900 leading-none">
                Go<span className="text-primary italic">Gadget</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">
                Admin Panel
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-white px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-4">
            General Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarNav />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-white p-4 border-t border-slate-50">
        <div className="bg-slate-50 rounded-[2rem] p-2">
          <SidebarUser />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
