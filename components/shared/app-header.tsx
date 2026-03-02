"use client";

import { Separator } from "@radix-ui/react-separator";
import { SidebarTrigger } from "../ui/sidebar";
import { Bell } from "lucide-react";

type props = {
  title: string;
};

function AppHeader({ title }: props) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-slate-100 rounded-2xl shadow-sm shadow-slate-200/20 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Sidebar Trigger dengan Hover Effect yang Halus */}
        <div className="p-1 rounded-xl hover:bg-slate-100 transition-colors">
          <SidebarTrigger className="-ml-1 text-slate-500 hover:text-slate-900" />
        </div>

        {/* Separator yang Lebih Minimalis */}
        <div className="h-4 w-1px bg-slate-200 rotate-15" />

        {/* Breadcrumb / Title Area */}
        <div className="flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 leading-none mb-1">
            Dashboard
          </p>
          <h2 className="font-black text-sm tracking-tight text-slate-900 uppercase">
            {title}
          </h2>
        </div>
      </div>

      {/* Tambahkan Area Action atau Status di sisi kanan jika perlu */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            System Live
          </span>
        </div>

        {/* Placeholder untuk Bell Notification atau Search jika nanti ada */}
        <button className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
