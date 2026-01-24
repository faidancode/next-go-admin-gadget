"use client";

import { useEffect, useRef } from "react";
import { apiRequest, unwrapEnvelope, ApiError } from "@/lib/api/fetcher";
import { AuthMeData } from "@/types";
import { useAuthStore } from "@/app/stores/auth";

type Props = {
  children: React.ReactNode;
};

export default function AuthBootstrapProvider({ children }: Props) {
  const {
    user,
    hasHydrated,
    isValidating,
    isSessionExpired,
    login,
    markSessionExpired,
    setValidating,
  } = useAuthStore();

  // 🛑 pastikan bootstrap cuma jalan SEKALI
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (user) return;
    if (isValidating) return;
    if (isSessionExpired) return;
    if (hasBootstrapped.current) return;

    hasBootstrapped.current = true;
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
      .catch((error) => {
        /**
         * ⚠️ PENTING:
         * - Jangan redirect
         * - Jangan logout di sini
         * - Cukup tandai session expired
         */
        if (error instanceof ApiError && error.status === 401) {
          markSessionExpired();
        }
      })
      .finally(() => {
        setValidating(false);
      });
  }, [
    hasHydrated,
    user,
    isValidating,
    isSessionExpired,
    login,
    markSessionExpired,
    setValidating,
  ]);

  return <>{children}</>;
}
