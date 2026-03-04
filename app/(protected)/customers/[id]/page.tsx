"use client";

import { useCustomerAddresses, useCustomerDetail, useCustomerOrders, useToggleCustomerStatus } from "@/hooks/use-customer";
import { useParams, useRouter } from "next/navigation";
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    ShoppingBag,
    ChevronLeft,
    Loader2,
    Power,
    PowerOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/table/data-table";
import { addressColumns } from "./address-columns";
import { orderColumns } from "./order-columns";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/shared/app-header";
import SkeletonTable from "@/components/shared/table/skeleton-table";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: customer, isLoading: isCustomerLoading, error: customerError } = useCustomerDetail(id);
    const toggleStatus = useToggleCustomerStatus();
    const [showToggleModal, setShowToggleModal] = useState(false);

    // States for Address Table
    const [addrPage, setAddrPage] = useState(1);
    const [addrLimit, setAddrLimit] = useState(10);
    const [addrSort, setAddrSort] = useState("createdAt:desc");

    // States for Order Table
    const [orderPage, setOrderPage] = useState(1);
    const [orderLimit, setOrderLimit] = useState(10);
    const [orderSort, setOrderSort] = useState("createdAt:desc");

    const { data: addressesData, isLoading: isAddrLoading } = useCustomerAddresses(id, addrPage, addrLimit, addrSort);
    const { data: ordersData, isLoading: isOrdersLoading } = useCustomerOrders(id, orderPage, orderLimit, orderSort);

    if (isCustomerLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    if (customerError || !customer) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <User size={64} className="text-slate-100" />
                <p className="text-slate-500 font-bold">Customer not found or failed to load.</p>
                <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <>
            <AppHeader
                title="Customer Profile"
            />

            <div className="container py-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 -ml-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl font-bold text-[10px] uppercase tracking-widest"
                >
                    <ChevronLeft size={16} className="mr-1" /> Back to List
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-4 space-y-6 sticky top-24">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <div className="p-8 text-center space-y-4 border-b border-slate-50 relative overflow-hidden">
                                {/* Decorative background element */}
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

                                <div className="h-24 w-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 border-4 border-white shadow-lg">
                                    <User size={48} strokeWidth={2.5} />
                                </div>

                                <div className="space-y-1">
                                    <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900 leading-none">
                                        {customer.name}
                                    </h1>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        ID: {customer.id}
                                    </p>
                                </div>

                                <div className="flex justify-center gap-2 pt-2">
                                    <Badge
                                        className={cn(
                                            "rounded-xl px-4 py-2 font-black uppercase text-[9px] tracking-[0.15em] border-none shadow-sm",
                                            customer.isActive
                                                ? "bg-emerald-50 text-emerald-600 shadow-emerald-100"
                                                : "bg-rose-50 text-rose-600 shadow-rose-100"
                                        )}
                                    >
                                        {customer.isActive ? "Active Account" : "Inactive Account"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group">
                                        <div className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Email Address</p>
                                            <p className="text-sm font-bold text-slate-700">{customer.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Phone Number</p>
                                            <p className="text-sm font-bold text-slate-700">{customer.phone || "-"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Member Since</p>
                                            <p className="text-sm font-bold text-slate-700">{formatDate(customer.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4">
                                    <Button
                                        onClick={() => setShowToggleModal(true)}
                                        variant="outline"
                                        className={cn(
                                            "w-full h-14 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98]",
                                            customer.isActive
                                                ? "border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                                                : "border-emerald-100 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200"
                                        )}
                                    >
                                        {customer.isActive ? <PowerOff size={18} className="mr-2" /> : <Power size={18} className="mr-2" />}
                                        {customer.isActive ? "Deactivate Customer" : "Activate Customer"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Content Tabs */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <Tabs defaultValue="orders" className="w-full">
                            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm mb-6">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                    <ShoppingBag size={14} /> Records & Activity
                                </h2>
                                <TabsList className="bg-slate-50 rounded-xl p-1 h-11 border-none">
                                    <TabsTrigger
                                        value="orders"
                                        className="rounded-lg font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm px-6"
                                    >
                                        Orders
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="addresses"
                                        className="rounded-lg font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm px-6"
                                    >
                                        Addresses
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="orders" className="mt-0">
                                {isOrdersLoading ? (
                                    <SkeletonTable />
                                ) : (
                                    <div className="rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/10 bg-white">
                                        <DataTable
                                            columns={orderColumns}
                                            data={ordersData?.data || []}
                                            page={orderPage}
                                            setPage={setOrderPage}
                                            limit={orderLimit}
                                            setLimit={setOrderLimit}
                                            totalPages={ordersData?.meta.totalPages || 1}
                                            sort={orderSort}
                                            setSort={setOrderSort}
                                        />
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="addresses" className="mt-0">
                                {isAddrLoading ? (
                                    <SkeletonTable />
                                ) : (
                                    <div className="rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/10 bg-white">
                                        <DataTable
                                            columns={addressColumns}
                                            data={addressesData?.data || []}
                                            page={addrPage}
                                            setPage={setAddrPage}
                                            limit={addrLimit}
                                            setLimit={setAddrLimit}
                                            totalPages={addressesData?.meta.totalPages || 1}
                                            sort={addrSort}
                                            setSort={setAddrSort}
                                        />
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Toggle Confirmation Modal */}
            <AlertDialog open={showToggleModal} onOpenChange={setShowToggleModal}>
                <AlertDialogContent className="rounded-[2rem] border-none p-8 gap-6">
                    <AlertDialogHeader>
                        <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                            <User size={28} />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">
                            {customer.isActive ? "Deactivate Account?" : "Activate Account?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-medium">
                            Are you sure you want to {customer.isActive ? "deactivate" : "activate"} <b>{customer.name}</b>?
                            This will immediately affect their ability to access the platform.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="h-12 rounded-xl border-slate-100 font-bold text-[10px] uppercase tracking-widest">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                toggleStatus.mutate({
                                    id: customer.id,
                                    isActive: !customer.isActive
                                });
                            }}
                            className={cn(
                                "h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95",
                                customer.isActive ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
                            )}
                        >
                            {toggleStatus.isPending ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                            Confirm Change
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
