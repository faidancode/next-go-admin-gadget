"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../stores/auth";
import { ADMIN_ROLES } from "@/constants/roles";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Toaster } from "sonner";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hasHydrated, isValidating, isSessionExpired } = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated || isValidating) return;

    if (!user || isSessionExpired) {
      router.replace("/login");
      return;
    }

    if (!ADMIN_ROLES.includes(user.role)) {
      router.replace("/login");
      return;
    }
  }, [hasHydrated, isValidating, user, isSessionExpired]);

  if (!hasHydrated || isValidating) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full p-4 bg-gray-100">
        {children}
        <Toaster />
      </main>
    </SidebarProvider>
  );
}
