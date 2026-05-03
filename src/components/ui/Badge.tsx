import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const roleColors: Record<Role, string> = {
  CUSTOMER: "bg-blue-100 text-blue-700",
  HOST: "bg-green-100 text-green-700",
  ADMIN: "bg-orange-100 text-orange-700",
  SYSTEM_ADMIN: "bg-red-100 text-red-700",
};

const roleLabels: Record<Role, string> = {
  CUSTOMER: "Customer",
  HOST: "Host",
  ADMIN: "Admin",
  SYSTEM_ADMIN: "Super Admin",
};

interface BadgeProps {
  role?: Role;
  label?: string;
  color?: string;
  className?: string;
}

export default function Badge({ role, label, color, className }: BadgeProps) {
  const colorClass = role ? roleColors[role] : color || "bg-gray-100 text-gray-700";
  const text = role ? roleLabels[role] : label || "";

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", colorClass, className)}>
      {text}
    </span>
  );
}
