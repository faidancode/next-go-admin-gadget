"use client";

import AppHeader from "@/components/shared/app-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { CategoryDistributionList } from "@/components/dashboard/category-distribution";
import { DataTable } from "@/components/shared/table/data-table";
import { useDashboard } from "@/hooks/use-dashboard";
import { columns } from "./columns";
import {
  Package,
  Tag,
  Layers,
  Users,
  ShoppingCart,
  DollarSign,
  Loader2
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { data, isLoading, error } = useDashboard();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("date:desc");

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-rose-600 font-bold">
        Failed to load dashboard data. Please try again later.
      </div>
    );
  }

  const { stats, recentOrders, categoryDistribution } = data;

  const statsConfig = [
    {
      title: "Total Revenue",
      value: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(stats.totalRevenue),
      icon: DollarSign,
      trend: { value: 12, isUp: true },
      description: "Since last month",
      iconClassName: "text-emerald-500 bg-emerald-50 hover:bg-emerald-100"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      trend: { value: 8, isUp: true },
      description: "New orders today",
      iconClassName: "text-blue-500 bg-blue-50 hover:bg-blue-100"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      trend: { value: 5, isUp: true },
      description: "Growth rate",
      iconClassName: "text-purple-500 bg-purple-50 hover:bg-purple-100"
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      description: "Active in catalog",
      iconClassName: "text-amber-500 bg-amber-50 hover:bg-amber-100"
    },
  ];

  return (
    <>
      <AppHeader title="Dashboard" />
      <div className="container pt-6 space-y-8 animate-in fade-in duration-500">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Recent Orders
              </h3>
            </div>
            <DataTable
              columns={columns}
              data={recentOrders}
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}
              totalPages={1} // Dashboard usually shows fixed recent items
              sort={sort}
              setSort={setSort}
            />
          </div>

          {/* Category Distribution */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Inventory Split
            </h3>
            <CategoryDistributionList data={categoryDistribution} />
          </div>
        </div>

        {/* Minimal stats for Brands & Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white/50">
            <div className="p-3 rounded-xl bg-slate-100 text-slate-400">
              <Tag size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brands</p>
              <p className="text-sm font-bold text-slate-900">{stats.totalBrands} Global Brands</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white/50">
            <div className="p-3 rounded-xl bg-slate-100 text-slate-400">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categories</p>
              <p className="text-sm font-bold text-slate-900">{stats.totalCategories} Active Categories</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
