// app/(auth)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
