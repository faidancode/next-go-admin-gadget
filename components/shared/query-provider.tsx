"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/fetcher";
import { useAuthStore } from "@/app/stores/auth";

interface Props {
  children: React.ReactNode;
}

function isSessionExpiredError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    typeof error.body === "object" &&
    error.body !== null &&
    (error.body as any).shouldLogout === true
  );
}

export default function QueryProvider({ children }: Props) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (error instanceof ApiError) {
                const status = error.status;

                // ⛔ semua client error langsung gagal
                if (status >= 400 && status < 500) {
                  return false;
                }
              }

              // ✅ hanya network / 5xx
              return failureCount < 3;
            },

            staleTime: 1000 * 60,
          },
          mutations: {
            retry: (failureCount, error) => {
              if (error instanceof ApiError) {
                const status = error.status;

                // ⛔ semua client error langsung gagal
                if (status >= 400 && status < 500) {
                  return false;
                }
              }

              // ✅ hanya network / 5xx
              return failureCount < 3;
            },
          },
        },
      }),
  );

  const handleSessionExpired = async () => {
    logout();

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.push("/login");
    }
  };

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated") {
        const error = event.query.state.error;
        if (error && isSessionExpiredError(error)) {
          handleSessionExpired();
        }
      }
    });

    return unsubscribe;
  }, [queryClient, router, logout]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
