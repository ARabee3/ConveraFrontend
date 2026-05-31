"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Home, Eye, EyeOff, User, Building2 } from "lucide-react";
import { authApi } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  confirmPassword: z.string(),
  role: z.enum(["CUSTOMER", "HOST"]),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const defaultRole = searchParams.get("role") === "HOST" ? "HOST" : "CUSTOMER";

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      await authApi.register(data.email, data.password, data.role);
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error?.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Home className="w-7 h-7 text-[#FF385C]" />
          <span className="text-2xl font-bold text-[#FF385C]">convera</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
        <p className="text-gray-500 text-sm mb-8">Join Convera to start {selectedRole === "HOST" ? "hosting" : "booking and exploring"}</p>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">I want to...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("role", "CUSTOMER")}
                className={`flex items-center gap-3 border rounded-xl p-3 transition-all ${
                  selectedRole === "CUSTOMER"
                    ? "border-[#FF385C] bg-red-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <User className={`w-5 h-5 ${selectedRole === "CUSTOMER" ? "text-[#FF385C]" : "text-gray-500"}`} />
                <div className="text-left">
                  <p className={`text-sm font-semibold ${selectedRole === "CUSTOMER" ? "text-[#FF385C]" : "text-gray-900"}`}>Book stays</p>
                  <p className="text-[10px] text-gray-500">Find properties & events</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setValue("role", "HOST")}
                className={`flex items-center gap-3 border rounded-xl p-3 transition-all ${
                  selectedRole === "HOST"
                    ? "border-[#FF385C] bg-red-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <Building2 className={`w-5 h-5 ${selectedRole === "HOST" ? "text-[#FF385C]" : "text-gray-500"}`} />
                <div className="text-left">
                  <p className={`text-sm font-semibold ${selectedRole === "HOST" ? "text-[#FF385C]" : "text-gray-900"}`}>Host guests</p>
                  <p className="text-[10px] text-gray-500">List your property</p>
                </div>
              </button>
            </div>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
          </div>

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
              placeholder="Create a strong password"
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
          <p className="text-xs text-gray-400 -mt-3">
            Min 8 chars, uppercase, lowercase, number & special character
          </p>

          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            label="Confirm password"
            placeholder="Repeat your password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" className="w-full py-3" isLoading={isSubmitting}>
            {selectedRole === "HOST" ? "Create host account" : "Create account"}
          </Button>
        </form>

        <div className="border-t border-gray-100 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#FF385C] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <RegisterForm />
    </Suspense>
  );
}
