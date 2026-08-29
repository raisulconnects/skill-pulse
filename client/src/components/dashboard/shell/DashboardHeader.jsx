"use client";

import React from "react";
import Link from "next/link";
import { Menu, Sparkles, LogOut, User } from "lucide-react";
import { ROLE_CONFIG } from "@/lib/dashboard-nav";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHeader({
  userRole = "student",
  onMenuClick = () => {},
}) {
  const { user, logout } = useAuth();
  const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.student;
  const RoleIcon = roleConfig.icon;

  return (
    <header className="sticky top-0 z-30 bg-[#fcfaf5]/90 backdrop-blur-md border-b border-[#b6b6b6]/40 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
        {/* Left: Mobile menu toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-[#1a3300] rounded-[6px] border border-[#1a3300]/20 hover:bg-[#1a3300]/5 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block font-mono text-[11px] text-[#1a3300]/60 uppercase tracking-wider">
              SkillPulse
            </span>
            <span className="hidden sm:inline-block text-[#1a3300]/40">/</span>
            <span
              className="font-bold text-[16px] sm:text-[18px] text-[#1a3300]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Dashboard Overview
            </span>
          </div>
        </div>

        {/* Right: Role Tag & User Menu */}
        <div className="flex items-center gap-3">
          {/* Role badge */}
          <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-[12px] font-mono font-bold border ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
            <RoleIcon className="w-3.5 h-3.5" />
            <span>{roleConfig.label}</span>
          </div>

          {/* User profile details */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#b6b6b6]/40">
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
        </div>
      </div>
    </header>
  );
}
