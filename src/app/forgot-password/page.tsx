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
  const [resendTimer, setResendTimer] = useState(0);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const handleSendCode = async (data: EmailForm) => {
    setServerError("");
    try {
      await authApi.forgotPassword(data.email);
      setSentEmail(data.email);
      resetForm.setValue("email", data.email);
      setStep(2);
      setResendTimer(60);
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error?.response?.data?.message || "Failed to send reset code");
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setServerError("");
    try {
      await authApi.forgotPassword(sentEmail);
      setResendTimer(60);
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error?.response?.data?.message || "Failed to resend code");
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
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md border border-neutral-100">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Home className="h-7 w-7 text-primary-600" aria-hidden="true" />
          <span className="text-2xl font-bold text-primary-600 tracking-tight">
            convera
          </span>
        </div>

        {success ? (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              Password reset!
            </h2>
            <p className="text-neutral-500 text-sm">Redirecting to login...</p>
          </div>
        ) : step === 1 ? (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">
              Forgot password?
            </h1>
            <p className="text-neutral-500 text-sm mb-8">
              Enter your email and we&apos;ll send you a reset code.
            </p>

            {serverError && (
              <div className="bg-error-50 border border-error-200 text-error-700 text-sm px-4 py-3 rounded-xl mb-6">
                {serverError}
              </div>
            )}

            <form
              onSubmit={emailForm.handleSubmit(handleSendCode)}
              className="space-y-5"
            >
              <Input
                type="email"
                label="Email address"
                placeholder="you@example.com"
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register("email")}
              />
              <Button
                type="submit"
                className="w-full py-3"
                isLoading={emailForm.formState.isSubmitting}
              >
                Send reset code
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">
              Reset your password
            </h1>
            <p className="text-neutral-500 text-sm mb-8">
              Enter the code sent to{" "}
              <span className="font-medium text-neutral-900">{sentEmail}</span>{" "}
              and your new password.
            </p>

            {serverError && (
              <div className="bg-error-50 border border-error-200 text-error-700 text-sm px-4 py-3 rounded-xl mb-6">
                {serverError}
              </div>
            )}

            <form
              onSubmit={resetForm.handleSubmit(handleReset)}
              className="space-y-5"
            >
              <input type="hidden" {...resetForm.register("email")} />
              <Input
                label="Reset code"
                placeholder="6-digit code"
                maxLength={6}
                error={resetForm.formState.errors.code?.message}
                {...resetForm.register("code")}
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  label="New password"
                  placeholder="Create a strong password"
                  error={resetForm.formState.errors.password?.message}
                  {...resetForm.register("password")}
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
              <Button
                type="submit"
                className="w-full py-3"
                isLoading={resetForm.formState.isSubmitting}
              >
                Reset password
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleResend}
                disabled={resendTimer > 0}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors"
              >
                {resendTimer > 0
                  ? `Resend code in ${resendTimer}s`
                  : "Resend code"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
