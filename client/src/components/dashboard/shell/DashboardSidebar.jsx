"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogOut, ChevronRight } from "lucide-react";
import { DASHBOARD_NAV, ROLE_CONFIG } from "@/lib/dashboard-nav";
import { useAuth } from "@/context/AuthContext";

export default function DashboardSidebar({
  userRole = "student",
  mobileOpen = false,
  setMobileOpen = () => {},
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const navItems = DASHBOARD_NAV[userRole] || DASHBOARD_NAV.student;
  const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.student;
  const RoleIcon = roleConfig.icon;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#fcfaf5] border-r border-[#b6b6b6]/40 p-4">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#b6b6b6]/40">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ffe95c] rounded-[8px] flex items-center justify-center border border-[#1a3300]/15 shadow-sm">
            <span className="font-bold text-[#1a3300] text-lg font-mono tracking-tight">SP</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[20px] text-[#1a3300] tracking-tight leading-none">
              SkillPulse
            </span>
            <span className="text-[10px] font-mono text-[#1a3300]/60 tracking-wider uppercase mt-0.5">
              LMS Dashboard
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-[#1a3300] rounded-[6px] hover:bg-[#1a3300]/5"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Identifier Badge */}
      <div className="mb-6 p-3 rounded-[10px] bg-[#fcfaf5] border border-[#1a3300]/15 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-[6px] ${roleConfig.badgeBg} flex items-center justify-center text-[#1a3300] border ${roleConfig.badgeBorder}`}>
          <RoleIcon className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono text-[#1a3300]/60 uppercase tracking-wider">
            Workspace Mode
          </span>
          <span className="text-[14px] font-bold text-[#1a3300] truncate">
            {roleConfig.label}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-1">
        <span className="px-3 text-[11px] font-mono text-[#1a3300]/60 uppercase tracking-wider block mb-2">
          Navigation
        </span>
        {navItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-[14px] font-medium transition-all ${
                isActive
                  ? "bg-[#1a3300] text-[#fcfaf5] shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px]"
                  : "text-[#1a3300] hover:bg-[#1a3300]/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <ItemIcon className={`w-4 h-4 ${isActive ? "text-[#ffe95c]" : "text-[#1a3300]/70"}`} />
                <span>{item.name}</span>
              </div>

              {item.badge ? (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] border ${
                    isActive
                      ? "bg-[#ffe95c] text-[#1a3300] border-transparent"
                      : "bg-[#d5f5c2] text-[#1a3300] border-[#1a3300]/20"
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-[#fcfaf5]/60" : "text-[#1a3300]/30"}`} />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / User Profile Card */}
      <div className="pt-4 border-t border-[#b6b6b6]/40 mt-auto">
        <div className="bg-[#d5f5c2]/40 border border-[#1a3300]/15 rounded-[10px] p-3 flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1a3300] text-[#fcfaf5] font-mono text-[13px] font-bold flex items-center justify-center shrink-0">
              {(user?.username || user?.email || "U")[0].toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-[#1a3300] truncate">
                {user?.username || "User"}
              </span>
              <span className="text-[11px] font-mono text-[#1a3300]/70 truncate">
                {user?.email}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-[#1a3300]/70 hover:text-[#1a3300] hover:bg-[#1a3300]/10 rounded-[6px] transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <Link
          href="/"
          className="text-[12px] font-mono text-[#1a3300]/60 hover:text-[#1a3300] flex items-center justify-center gap-1 py-1"
        >
          <span>← Back to Public Site</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#1a3300]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-[#fcfaf5] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
