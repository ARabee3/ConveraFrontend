"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, User, Building2 } from "lucide-react";
import { authApi } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const schema = z
  .object({
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
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const defaultRole =
    searchParams.get("role") === "HOST" ? "HOST" : "CUSTOMER";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
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
      setServerError(
        error?.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] p-8 sm:p-10 w-full max-w-md border border-neutral-100/80 relative">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white shadow-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-3xl font-extrabold text-neutral-900 tracking-tighter">
            Convera.
          </span>
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Create an account
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          Join Convera to start{" "}
          {selectedRole === "HOST" ? "hosting" : "booking and exploring"}
        </p>

        {serverError && (
          <div className="bg-error-50 border border-error-200 text-error-700 text-sm px-4 py-3 rounded-xl mb-6">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-2">
              I want to...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("role", "CUSTOMER")}
                className={`flex items-center gap-3 border rounded-[1rem] p-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${
                  selectedRole === "CUSTOMER"
                    ? "border-primary-500/50 bg-primary-50/50 shadow-sm"
                    : "border-neutral-200/60 bg-neutral-50/50 hover:bg-neutral-100 hover:border-neutral-300"
                }`}
                aria-pressed={selectedRole === "CUSTOMER"}
              >
                <User
                  className={`h-5 w-5 ${
                    selectedRole === "CUSTOMER"
                      ? "text-primary-600"
                      : "text-neutral-500"
                  }`}
                  aria-hidden="true"
                />
                <div className="text-left">
                  <p
                    className={`text-sm font-semibold ${
                      selectedRole === "CUSTOMER"
                        ? "text-primary-700"
                        : "text-neutral-900"
                    }`}
                  >
                    Book stays
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Find properties & events
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setValue("role", "HOST")}
                className={`flex items-center gap-3 border rounded-[1rem] p-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${
                  selectedRole === "HOST"
                    ? "border-primary-500/50 bg-primary-50/50 shadow-sm"
                    : "border-neutral-200/60 bg-neutral-50/50 hover:bg-neutral-100 hover:border-neutral-300"
                }`}
                aria-pressed={selectedRole === "HOST"}
              >
                <Building2
                  className={`h-5 w-5 ${
                    selectedRole === "HOST"
                      ? "text-primary-600"
                      : "text-neutral-500"
                  }`}
                  aria-hidden="true"
                />
                <div className="text-left">
                  <p
                    className={`text-sm font-semibold ${
                      selectedRole === "HOST"
                        ? "text-primary-700"
                        : "text-neutral-900"
                    }`}
                  >
                    Host guests
                  </p>
                  <p className="text-xs text-neutral-500">List your property</p>
                </div>
              </button>
            </div>
            {errors.role && (
              <p className="mt-1 text-xs text-error-600">{errors.role.message}</p>
            )}
          </div>

          <Input
            type="email"
            label="Email address"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Create a strong password"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-neutral-400 -mt-3">
            Min 8 chars, uppercase, lowercase, number & special character
          </p>

          <Input
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

        <div className="border-t border-neutral-100 mt-8 pt-6 text-center">
          <p className="text-sm text-neutral-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
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
