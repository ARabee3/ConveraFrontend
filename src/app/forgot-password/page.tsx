"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Home, CheckCircle, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const emailSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits"),
  password: z
    .string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Uppercase required")
    .regex(/[a-z]/, "Lowercase required")
    .regex(/[0-9]/, "Number required")
    .regex(/[^A-Za-z0-9]/, "Special character required"),
});

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [sentEmail, setSentEmail] = useState("");
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const handleSendCode = async (data: EmailForm) => {
    setServerError("");
    try {
      await authApi.forgotPassword(data.email);
      setSentEmail(data.email);
      resetForm.setValue("email", data.email);
      setStep(2);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error?.response?.data?.message || "Failed to send reset code");
    }
  };

  const handleReset = async (data: ResetForm) => {
    setServerError("");
    try {
      await authApi.resetPassword(data.email, data.code, data.password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error?.response?.data?.message || "Reset failed. Check your code.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Home className="w-7 h-7 text-[#FF385C]" />
          <span className="text-2xl font-bold text-[#FF385C]">convera</span>
        </div>

        {success ? (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Password reset!</h2>
            <p className="text-gray-500 text-sm">Redirecting to login...</p>
          </div>
        ) : step === 1 ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h1>
            <p className="text-gray-500 text-sm mb-8">Enter your email and we&apos;ll send you a reset code.</p>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">{serverError}</div>
            )}

            <form onSubmit={emailForm.handleSubmit(handleSendCode)} className="space-y-5">
              <Input
                id="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register("email")}
              />
              <Button type="submit" className="w-full py-3" isLoading={emailForm.formState.isSubmitting}>
                Send reset code
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h1>
            <p className="text-gray-500 text-sm mb-8">
              Enter the code sent to <span className="font-medium text-gray-900">{sentEmail}</span> and your new password.
            </p>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">{serverError}</div>
            )}

            <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-5">
              <input type="hidden" {...resetForm.register("email")} />
              <Input
                id="code"
                label="Reset code"
                placeholder="6-digit code"
                maxLength={6}
                error={resetForm.formState.errors.code?.message}
                {...resetForm.register("code")}
              />
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  label="New password"
                  placeholder="Create a strong password"
                  error={resetForm.formState.errors.password?.message}
                  {...resetForm.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" className="w-full py-3" isLoading={resetForm.formState.isSubmitting}>
                Reset password
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
