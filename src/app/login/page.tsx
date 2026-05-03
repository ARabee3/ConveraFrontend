"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Home, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { AuthTokens } from "@/lib/types";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.data as AuthTokens);
      router.push("/");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error?.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <Home className="w-7 h-7 text-[#FF385C]" />
          <span className="text-2xl font-bold text-[#FF385C]">convera</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-8">Log in to your Convera account</p>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-[#FF385C] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full py-3" isLoading={isSubmitting}>
            Log in
          </Button>
        </form>

        <div className="border-t border-gray-100 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#FF385C] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
