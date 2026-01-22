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
import { Eye, EyeOff, ShieldAlert, UserCheck } from "lucide-react";
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex justify-center my-3">
            <Image src="/logo.svg" alt="logo" height={28} width={28} />
            <p className="ml-2 font-bold text-2xl text-primary">GoGadget</p>
          </div>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginError && (
            <div className="flex items-center p-2 border-l-4 border-red-600 bg-red-100 text-red-600 gap-2 my-2 text-xs  rounded-sm">
              <ShieldAlert className="h-6 w-6 text-red-600" />
              {loginError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                  {...register("email", { required: true })}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  {/* <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a> */}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    {...register("password", { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Field>
              <Field>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={handleGuestAdminLogin}
                  className="w-full"
                >
                  <UserCheck />
                  Login as Guest Admin
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
