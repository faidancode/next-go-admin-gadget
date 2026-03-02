"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner"; // atau "@/components/ui/use-toast" sesuai project

import { useAuthStore } from "@/app/stores/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api/errors";
import { apiRequest, unwrapEnvelope } from "@/lib/api/fetcher";
import { cn } from "@/lib/utils";
import { LoginFormValues } from "@/lib/validations/auth-schema";
import { AuthMeData, AuthUser } from "@/types";
import { Eye, EyeOff, Loader2, ShieldAlert, UserCheck } from "lucide-react";
import Image from "next/image";

type LoginFormProps = React.ComponentProps<"div"> & {
  onLoginSuccess?: () => void;
};

const GUEST_ADMIN_CREDENTIALS: LoginFormValues = {
  email: "guestadmin@GoGadget.com",
  password: "Guest123**",
};

export function LoginForm({
  className,
  onLoginSuccess,
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [showPassword, setShowPassword] = React.useState(false);

  const [loginError, setLoginError] = React.useState<string | null>(null);

  const { login } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      // Login hanya melakukan autentikasi + set cookie
      return apiRequest<AuthMeData>("/auth/login", values, {
        method: "POST",
      });
    },

    onSuccess: async (loginRes) => {
      setLoginError(null);
      console.log({ loginRes });
      // 1️⃣ Pastikan login benar-benar sukses (envelope-level)
      unwrapEnvelope(loginRes, "Login failed");

      // 2️⃣ Ambil data user (auth/me)
      try {
        const me = unwrapEnvelope(
          await apiRequest<AuthMeData>("/auth/me"),
          "Unauthorized",
        );

        const authUser: AuthUser = {
          id: me.userId,
          role: me.role,
          name: me.name,
          email: me.email,
        };

        // 3️⃣ Hydrate auth store
        login(authUser);
        // 4️⃣ Redirect
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          router.replace("/dashboard?login=success");
        }
      } catch (error) {
        // ⚠️ Login SUKSES, tapi hydrate user gagal
        toast.warning(
          getErrorMessage(
            error,
            "Login successful, but failed to retrieve user data.",
          ),
        );
      }
    },

    onError: (error) => {
      // ❌ Login gagal (credential / server error)
      const message = getErrorMessage(error, "Login failed. Please try again.");

      setLoginError(message);
      toast.error(message);
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoginError(null);
    try {
      await loginMutation.mutateAsync(values);
    } catch {
      // Error already surfaced via toast + inline helper
    }
  };

  const isLoading = isSubmitting || loginMutation.isPending;

  const handleGuestAdminLogin = async () => {
    setLoginError(null);
    try {
      await loginMutation.mutateAsync(GUEST_ADMIN_CREDENTIALS);
    } catch {
      // error sudah ditangani di onError mutation
    }
  };

  return (
    <div className={cn("min-h-[80vh] flex items-center justify-center p-4", className)} {...props}>
      <div className="w-full max-w-[400px] space-y-8">
        {/* --- BRAND LOGO --- */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Image src="/logo.svg" alt="logo" height={28} width={28} className="brightness-0 invert" />
          </div>
          <div className="text-center mt-2">
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 flex items-center justify-center gap-1">
              Go<span className="text-primary italic">Gadget</span>

            </h1>
          </div>
        </div>

        <Card className="border-slate-200/80 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="pt-8 pb-4 px-8 text-center">
            <CardTitle className="text-xl font-bold tracking-tight text-slate-800">Welcome Back</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">
              Authorized personnel only. Please enter your credentials.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-0">
            {/* --- ERROR MESSAGE --- */}
            {loginError && (
              <div className="flex items-center gap-3 p-3 mb-6 bg-red-50 border border-red-100 rounded-2xl text-[11px] font-bold text-red-600 animate-in fade-in slide-in-from-top-1">
                <ShieldAlert size={18} className="shrink-0" />
                {loginError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Email Address
                  </FieldLabel>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@gogadget.com"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 focus:bg-white transition-all focus:ring-2 focus:ring-primary/20"
                      {...register("email", { required: true })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <FieldLabel htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Password
                    </FieldLabel>
                  </div>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/50 px-4 focus:bg-white transition-all focus:ring-2 focus:ring-primary/20"
                      {...register("password", { required: true })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-primary text-white font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                    <span className="bg-white px-3 text-slate-300">Quick Access</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={handleGuestAdminLogin}
                  className="w-full h-12 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all"
                >
                  <UserCheck size={16} className="text-primary" />
                  Login as Guest Admin
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] font-medium text-slate-400 tracking-wide uppercase">
          &copy; 2026 GoGadget Systems &bull; Secure Connection
        </p>
      </div>
    </div>
  );
}
