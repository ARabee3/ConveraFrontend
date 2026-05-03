"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, Suspense } from "react";
import { Home, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = z.object({ code: z.string().length(6, "Code must be 6 digits") });
type FormData = z.infer<typeof schema>;

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") || "";
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      await authApi.verify(email, data.code);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error?.response?.data?.message || "Invalid or expired code");
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-500 text-sm">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
            <p className="text-gray-500 text-sm mb-8">
              Enter the 6-digit code sent to <span className="font-medium text-gray-900">{email}</span>
            </p>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                id="code"
                label="Verification code"
                placeholder="123456"
                maxLength={6}
                error={errors.code?.message}
                {...register("code")}
              />
              <Button type="submit" className="w-full py-3" isLoading={isSubmitting}>
                Verify email
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF385C]"></div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
