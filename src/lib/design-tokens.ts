// Shared design tokens and constants for the Convera platform

export const TOKENS = {
  colors: {
    primary: {
      50: "#FFF1F2",
      100: "#FFE4E6",
      200: "#FECDD3",
      300: "#FDA4AF",
      400: "#FB7185",
      500: "#F43F5E",
      600: "#E11D48",
      700: "#BE123C",
      800: "#9F1239",
      900: "#881337",
    },
    neutral: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
      950: "#030712",
    },
  },
  spacing: {
    section: "py-16",
    sectionLg: "py-24",
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    cardPadding: "p-6",
    cardGap: "gap-6",
  },
  shadows: {
    card: "shadow",
    cardHover: "shadow-md",
    navbar: "shadow-navbar",
  },
  radius: {
    card: "rounded-2xl",
    button: "rounded-lg",
    input: "rounded-xl",
    pill: "rounded-full",
  },
} as const;

export const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  USER: { bg: "bg-neutral-100", text: "text-neutral-700" },
  HOST: { bg: "bg-primary-50", text: "text-primary-700" },
  ADMIN: { bg: "bg-warning-50", text: "text-warning-700" },
  SYSTEM_ADMIN: { bg: "bg-error-50", text: "text-error-700" },
};

export const STATUS_COLORS: Record<string, { bg: string; text: string; icon?: string }> = {
  PENDING_PAYMENT: { bg: "bg-warning-50", text: "text-warning-700", icon: "clock" },
  CONFIRMED: { bg: "bg-success-50", text: "text-success-700", icon: "check" },
  CANCELLED: { bg: "bg-error-50", text: "text-error-700", icon: "x" },
  COMPLETED: { bg: "bg-neutral-100", text: "text-neutral-700", icon: "check-circle" },
  ACTIVE: { bg: "bg-success-50", text: "text-success-700" },
  INACTIVE: { bg: "bg-neutral-100", text: "text-neutral-500" },
  PENDING: { bg: "bg-warning-50", text: "text-warning-700" },
};
