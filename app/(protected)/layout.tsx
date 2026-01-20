// app/(protected)/layout.tsx
"use client";

import { apiRequest, unwrapEnvelope } from "@/lib/api/fetcher";
import { AuthMeData } from "@/types";
import { usePathname, useRouter } from "next/navigation";
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
  const { user, hasHydrated, isValidating, login, logout, setValidating } =
    useAuthStore();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hasHydrated || isValidating || user) return;

    setValidating(true);

    apiRequest<AuthMeData>("/auth/me")
      .then((res) => {
        const me = unwrapEnvelope(res);

        login({
          id: me.userId,
          name: me.name,
          email: me.email,
          role: me.role,
        });
      })
      .catch(() => {
        logout();
        router.replace("/login");
      })
      .finally(() => {
        setValidating(false);
      });
  }, [hasHydrated, isValidating, user]);

  useEffect(() => {
    if (!hasHydrated || isValidating) return;

    // belum login
    if (!user) {
      router.replace("/login");
      return;
    }

    // role tidak diizinkan
    if (!ADMIN_ROLES.includes(user.role!)) {
      router.replace("/login");
    }
  }, [hasHydrated, isValidating, user, router]);

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
