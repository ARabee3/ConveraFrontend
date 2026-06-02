"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, MessageSquare, Calendar, Building2, User, Shield, LogOut, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getDisplayName } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
    setMenuOpen(false);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Focus first focusable element in menu
      const firstFocusable = mobileMenuRef.current?.querySelector(
        'a, button, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, handleKeyDown]);

  useLockBodyScroll(menuOpen);

  const closeMenu = () => setMenuOpen(false);

  const navItems = [
    ...(user
      ? [
          { href: "/bookings", label: "My Bookings", icon: Calendar },
          { href: "/chat", label: "Messages", icon: MessageSquare },
        ]
      : []),
    ...(user?.role === "HOST" || user?.role === "ADMIN" || user?.role === "SYSTEM_ADMIN"
      ? [{ href: "/host/properties", label: "Host Dashboard", icon: Building2 }]
      : []),
    ...(user?.role === "ADMIN" || user?.role === "SYSTEM_ADMIN"
      ? [{ href: "/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <div className="sticky top-4 z-50 px-4 max-w-7xl mx-auto w-full mb-4">
      <header className="bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] supports-[backdrop-filter]:bg-white/60 transition-all duration-300">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 transition-transform hover:scale-105 active:scale-95">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl font-extrabold text-neutral-900 tracking-tighter">
                Convera.
              </span>
            </Link>

          {/* Center pill - functional navigation */}
          <nav className="hidden md:flex items-center bg-white/50 backdrop-blur-sm border border-neutral-200/60 rounded-full px-1 py-1 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/80">
            <Link
              href="/properties"
              className="px-4 py-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-full hover:bg-neutral-50 transition-colors"
            >
              Properties
            </Link>
            <div className="h-4 w-px bg-neutral-200" aria-hidden="true" />
            <Link
              href="/events"
              className="px-4 py-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-full hover:bg-neutral-50 transition-colors"
            >
              Events
            </Link>
            <div className="h-4 w-px bg-neutral-200" aria-hidden="true" />
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-ai-search"))}
              className="px-4 py-1.5 text-sm font-semibold text-primary-600 hover:text-primary-800 rounded-full hover:bg-primary-50 transition-all flex items-center gap-1 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-500 animate-pulse group-hover:scale-110 transition-transform" />
              Ask AI
            </button>
          </nav>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            {mounted ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-primary-50/50"
                  >
                    {item.label}
                  </Link>
                ))}

                {user ? (
                  <div className="flex items-center gap-3 pl-2 border-l border-neutral-100">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
                    >
                      <Avatar name={getDisplayName(user.email)} size="sm" />
                      <span className="max-w-[120px] truncate hidden lg:block">
                        {getDisplayName(user.email)}
                      </span>
                    </Link>
                    <Badge variant="primary" size="sm">
                      {user.role === "SYSTEM_ADMIN" ? "Admin" : user.role}
                    </Badge>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-neutral-500 hover:text-error-600 transition-colors px-3 py-2 rounded-lg hover:bg-error-50"
                      aria-label="Log out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pl-2 border-l border-neutral-100">
                    <Link
                      href="/login"
                      className="text-sm font-medium text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      className="text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98]"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          <button
            ref={menuButtonRef}
            className="md:hidden p-2 rounded-xl hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5 text-neutral-700" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5 text-neutral-700" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile slide-over menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-neutral-950/30 backdrop-blur-sm md:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className="fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-white shadow-xl md:hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <span className="text-lg font-bold text-primary-600">Menu</span>
              <button
                onClick={closeMenu}
                className="p-2 rounded-lg hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                <MobileLink href="/properties" icon={Building2} onClick={closeMenu}>
                  Properties
                </MobileLink>
                <MobileLink href="/events" icon={Calendar} onClick={closeMenu}>
                  Events
                </MobileLink>
                <button
                  onClick={() => {
                    closeMenu();
                    window.dispatchEvent(new CustomEvent("open-ai-search"));
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-primary-500 animate-pulse" />
                  Ask AI
                </button>

                {user && (
                  <>
                    <MobileLink href="/bookings" icon={Calendar} onClick={closeMenu}>
                      My Bookings
                    </MobileLink>
                    <MobileLink href="/chat" icon={MessageSquare} onClick={closeMenu}>
                      Messages
                    </MobileLink>
                  </>
                )}

                {(user?.role === "HOST" || user?.role === "ADMIN" || user?.role === "SYSTEM_ADMIN") && (
                  <MobileLink href="/host/properties" icon={Building2} onClick={closeMenu}>
                    Host Dashboard
                  </MobileLink>
                )}

                {(user?.role === "ADMIN" || user?.role === "SYSTEM_ADMIN") && (
                  <MobileLink href="/admin" icon={Shield} onClick={closeMenu}>
                    Admin
                  </MobileLink>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-100">
                {user ? (
                  <div className="space-y-3">
                    <MobileLink href="/profile" icon={User} onClick={closeMenu}>
                      Profile
                    </MobileLink>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="flex w-full items-center justify-center rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeMenu}
                      className="flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
      </header>
    </div>
  );
}

function MobileLink({
  href,
  children,
  icon: Icon,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
    >
      <Icon className="h-4 w-4 text-neutral-400" aria-hidden="true" />
      {children}
    </Link>
  );
}
