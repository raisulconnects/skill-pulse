"use client";

import React from "react";
import Link from "next/link";
import { Menu, Sparkles, LogOut, User, Compass, ArrowRight } from "lucide-react";
import { ROLE_CONFIG } from "@/lib/dashboard-nav";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHeader({
  userRole = "student",
  onMenuClick = () => {},
}) {
  const { user, logout } = useAuth();
  const effectiveRole = !user ? "guest" : (user?.user_role || userRole);
  const roleConfig = ROLE_CONFIG[effectiveRole] || ROLE_CONFIG.guest;
  const RoleIcon = roleConfig.icon;

  return (
    <header className="sticky top-0 z-30 bg-[#fcfaf5]/90 backdrop-blur-md border-b border-[#b6b6b6]/40 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-[#1a3300] rounded-[6px] border border-[#1a3300]/20 hover:bg-[#1a3300]/5 transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-7 h-7 bg-[#ffe95c] rounded-[5px] flex items-center justify-center font-bold text-[#1a3300] text-xs font-mono border border-[#1a3300]/20 group-hover:scale-105 transition-transform">
                SP
              </span>
              <span className="hidden sm:inline-block font-mono text-[11px] text-[#1a3300]/70 uppercase tracking-wider font-semibold">
                SkillPulse
              </span>
            </Link>
            <span className="text-[#1a3300]/40">/</span>
            <span
              className="font-bold text-[16px] sm:text-[18px] text-[#1a3300]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              {!user ? "Course Catalog" : "Dashboard Workspace"}
            </span>
          </div>
        </div>

        {/* Right: Controls (Guest CTAs or User Menu) */}
        <div className="flex items-center gap-3">
          {/* Role badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-mono font-bold border ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
            <RoleIcon className="w-3.5 h-3.5" />
            <span>{roleConfig.label}</span>
          </div>

          {!user ? (
            /* Logged-out Guest CTA Buttons */
            <div className="flex items-center gap-2 pl-2 border-l border-[#b6b6b6]/40">
              <Link
                href="/login"
                className="btn-interactive text-[13px] font-medium px-3.5 py-1.5 rounded-[6px] border border-[#1a3300] text-[#1a3300] hover:bg-[#1a3300]/5"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="btn-interactive text-[13px] font-medium px-3.5 py-1.5 rounded-[6px] bg-[#1a3300] text-[#fcfaf5] hover:bg-[#1a3300]/95"
              >
                Register
              </Link>
            </div>
          ) : (
            /* Logged-in User Details & Logout */
            <div className="flex items-center gap-3 pl-2 border-l border-[#b6b6b6]/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[6px] bg-[#1a3300] text-[#fcfaf5] font-mono text-[13px] font-bold flex items-center justify-center">
                  {(user?.username || user?.email || "U")[0].toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-[13px] font-bold text-[#1a3300] leading-none mb-0.5">
                    {user?.username || "User"}
                  </span>
                  <span className="text-[10px] font-mono text-[#1a3300]/60 leading-none">
                    {user?.email}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-[#1a3300]/70 hover:text-[#cb5521] hover:bg-[#1a3300]/5 rounded-[6px] transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
