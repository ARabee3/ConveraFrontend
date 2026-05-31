"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, ChevronLeft, Bell } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return <LoadingSpinner fullPage />;

  const roleColors: Record<string, string> = {
    CUSTOMER: "bg-blue-100 text-blue-700",
    HOST: "bg-green-100 text-green-700",
    ADMIN: "bg-purple-100 text-purple-700",
    SYSTEM_ADMIN: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#FF385C]/10 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-[#FF385C]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm">Your account information</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
        {/* Email */}
        <div className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>
        </div>

        {/* Role */}
        <div className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Role</p>
            <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-full ${roleColors[user.role] || "bg-gray-100 text-gray-700"}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Settings link */}
        <Link
          href="/settings/notifications"
          className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Notification Settings</p>
            <p className="text-sm text-gray-500">Manage your email preferences</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
        </Link>
      </div>
    </div>
  );
}
