"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export default function Footer() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHost =
    user?.role === "HOST" ||
    user?.role === "ADMIN" ||
    user?.role === "SYSTEM_ADMIN";

  // Server renders null (no user) — both sides agree on logged-out state
  // After mount, swap to actual auth state
  const showUser = mounted && user;

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-primary-400" aria-hidden="true" />
              <span className="text-lg font-bold text-white">convera</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
              Find your perfect stay or discover unforgettable events. Convera
              connects travelers with amazing experiences around the world.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-500 mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/properties"
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-150"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-150"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/bookings"
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-150"
                >
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-500 mb-4">
              Account
            </h3>
            <ul className="space-y-3">
              {showUser ? (
                <>
                  <li>
                    <Link
                      href="/profile"
                      className="text-sm text-neutral-400 hover:text-white transition-colors duration-150"
                    >
                      My Profile
                    </Link>
                  </li>
                  {isHost ? (
                    <li>
                      <Link
                        href="/host/properties"
                        className="text-sm text-neutral-400 hover:text-white transition-colors duration-150"
                      >
                        Host Dashboard
                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link
                        href="/register?role=HOST"
                        className="text-sm text-neutral-400 hover:text-white transition-colors duration-150"
                      >
                        Become a Host
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="text-sm text-neutral-400 hover:text-white transition-colors duration-150"
                    >
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="text-sm text-neutral-400 hover:text-white transition-colors duration-150"
                    >
                      Sign up
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register?role=HOST"
                      className="text-sm text-neutral-400 hover:text-white transition-colors duration-150"
                    >
                      Become a Host
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-sm">
            © 2026 Convera. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              href="#"
              className="text-neutral-500 hover:text-neutral-300 transition-colors duration-150"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-neutral-500 hover:text-neutral-300 transition-colors duration-150"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
