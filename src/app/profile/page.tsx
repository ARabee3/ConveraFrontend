"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Shield, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { getDisplayName } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

const roleBadges: Record<string, { variant: "default" | "primary" | "success" | "warning" | "error" | "neutral"; label: string }> = {
  CUSTOMER: { variant: "neutral", label: "Customer" },
  HOST: { variant: "success", label: "Host" },
  ADMIN: { variant: "warning", label: "Admin" },
  SYSTEM_ADMIN: { variant: "error", label: "System Admin" },
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return <LoadingSpinner fullPage />;

  const roleBadge = roleBadges[user.role] || { variant: "neutral" as const, label: user.role };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Breadcrumb items={[{ label: "Profile" }]} className="mb-6" />

      <div className="flex items-center gap-4 mb-8">
        <Avatar name={getDisplayName(user.email)} size="xl" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {getDisplayName(user.email)}
          </h1>
          <p className="text-neutral-500 text-sm">{user.email}</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-100">
        {/* Email */}
        <div className="p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500">Email address</p>
            <p className="font-medium text-neutral-900">{user.email}</p>
          </div>
        </div>

        {/* Role */}
        <div className="p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
            <Shield className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500">Role</p>
            <div className="mt-1">
              <Badge variant={roleBadge.variant} size="sm">
                {roleBadge.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Settings link */}
        <Link
          href="/settings/notifications"
          className="p-5 flex items-center gap-4 hover:bg-neutral-50 transition-colors rounded-b-2xl"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-neutral-900">Notification Settings</p>
            <p className="text-sm text-neutral-500">
              Manage your email preferences
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-neutral-400" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
