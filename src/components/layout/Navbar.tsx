"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Home } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import Badge from "@/components/ui/Badge";

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
    setMenuOpen(false);
  };

  const navLinks = (
    <>
      {user?.role === "HOST" || user?.role === "ADMIN" || user?.role === "SYSTEM_ADMIN" ? (
        <Link
          href="/host/properties"
          className="text-sm font-medium text-gray-700 hover:text-[#FF385C] transition-colors"
          onClick={() => setMenuOpen(false)}
        >
          Host Dashboard
        </Link>
      ) : null}
      {user?.role === "ADMIN" || user?.role === "SYSTEM_ADMIN" ? (
        <Link
          href="/admin/events"
          className="text-sm font-medium text-gray-700 hover:text-[#FF385C] transition-colors"
          onClick={() => setMenuOpen(false)}
        >
          Admin
        </Link>
      ) : null}
      {user ? (
        <>
          <Link
            href="/bookings"
            className="text-sm font-medium text-gray-700 hover:text-[#FF385C] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            My Bookings
          </Link>
          <div className="flex items-center gap-2">
            <Badge role={user.role} />
            <span className="text-sm text-gray-600 hidden md:block max-w-[140px] truncate">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold border border-gray-300 rounded-full px-4 py-2 hover:shadow-md transition-shadow"
            >
              Log out
            </button>
          </div>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="text-sm font-semibold hover:text-[#FF385C] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold border border-gray-300 rounded-full px-4 py-2 hover:shadow-md transition-shadow"
            onClick={() => setMenuOpen(false)}
          >
            Sign up
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Home className="w-6 h-6 text-[#FF385C]" />
            <span className="text-xl font-bold text-[#FF385C] tracking-tight">convera</span>
          </Link>

          {/* Center pill search (decorative) */}
          <div className="hidden md:flex items-center border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer gap-3">
            <Link href="/properties" className="text-sm font-medium text-gray-800">Properties</Link>
            <div className="h-4 w-px bg-gray-300" />
            <Link href="/events" className="text-sm font-medium text-gray-800">Events</Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 flex flex-col gap-4">
            <Link href="/properties" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Properties</Link>
            <Link href="/events" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Events</Link>
            {navLinks}
          </div>
        )}
      </div>
    </header>
  );
}
