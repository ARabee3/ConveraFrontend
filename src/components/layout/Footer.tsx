"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export default function Footer() {
  const { user } = useAuthStore();

  const isHost = user?.role === "HOST" || user?.role === "ADMIN" || user?.role === "SYSTEM_ADMIN";

  return (
    <footer className="bg-[#222222] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-5 h-5 text-[#FF385C]" />
              <span className="text-lg font-bold text-[#FF385C]">convera</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Find your perfect stay or discover unforgettable events. Convera connects travelers with amazing experiences.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-gray-300">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/properties" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-gray-400 text-sm hover:text-white transition-colors">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-gray-300">Account</h3>
            <ul className="space-y-2">
              {user ? (
                <>
                  <li>
                    <Link href="/profile" className="text-gray-400 text-sm hover:text-white transition-colors">
                      My Profile
                    </Link>
                  </li>
                  {isHost ? (
                    <li>
                      <Link href="/host/properties" className="text-gray-400 text-sm hover:text-white transition-colors">
                        Host Dashboard
                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link href="/register?role=HOST" className="text-gray-400 text-sm hover:text-white transition-colors">
                        Become a Host
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="text-gray-400 text-sm hover:text-white transition-colors">
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-gray-400 text-sm hover:text-white transition-colors">
                      Sign up
                    </Link>
                  </li>
                  <li>
                    <Link href="/register?role=HOST" className="text-gray-400 text-sm hover:text-white transition-colors">
                      Become a Host
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 Convera. All rights reserved.</p>
          <div className="flex gap-6 text-gray-500 text-sm">
            <span className="hover:text-gray-300 cursor-pointer">Privacy</span>
            <span className="hover:text-gray-300 cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
