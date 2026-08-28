"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Shield, Sparkles, LogOut, ArrowRight } from "lucide-react";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import StudentDashboard from "@/components/dashboard/roles/StudentDashboard";
import InstructorDashboard from "@/components/dashboard/roles/InstructorDashboard";
import ContentManagerDashboard from "@/components/dashboard/roles/ContentManagerDashboard";
import AdminDashboard from "@/components/dashboard/roles/AdminDashboard";

const ROLE_COMPONENTS = {
  student: StudentDashboard,
  instructor: InstructorDashboard,
  content_manager: ContentManagerDashboard,
  admin: AdminDashboard,
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  // 1. Clean Loading State during Auth initialization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfaf5] flex flex-col items-center justify-center p-6 text-[#1a3300]">
        <div className="w-10 h-10 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mb-4" />
        <p className="font-mono text-[14px] text-[#1a3300]/80">
          Loading SkillPulse Workspace...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated User View
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcfaf5] flex flex-col items-center justify-center p-6 text-center text-[#1a3300]">
        <div className="max-w-[420px] w-full bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-8 shadow-[rgba(0,0,0,0.06)_0px_4px_12px]">
          <div className="w-12 h-12 bg-[#ffe95c] text-[#1a3300] rounded-full border border-[#1a3300]/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h1
            className="text-[26px] font-bold mb-2 text-[#1a3300]"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            Authentication Required
          </h1>
          <p className="text-[14px] text-[#1a3300]/80 mb-6 leading-relaxed">
            Please log in or register an account to access your SkillPulse dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full bg-[#1a3300] text-[#fcfaf5] py-3 rounded-[6px] font-medium hover:bg-[#1a3300]/90 transition-colors inline-flex items-center justify-center gap-2 text-[14px]"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 text-[#ffe95c]" />
            </Link>
            <Link
              href="/register"
              className="w-full bg-[#fcfaf5] text-[#1a3300] border border-[#1a3300] py-2.5 rounded-[6px] font-medium hover:bg-[#1a3300]/5 transition-colors text-[14px]"
            >
              Create an Account
            </Link>
            <Link
              href="/"
              className="text-[12px] font-mono text-[#1a3300]/60 hover:text-[#1a3300] mt-2 underline"
            >
              Back to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Resolve role component (defaulting safely to Student if unrecognized)
  const role = user.user_role || "student";
  const RoleDashboardComponent = ROLE_COMPONENTS[role] || StudentDashboard;

  return (
    <DashboardShell userRole={role}>
      <RoleDashboardComponent user={user} />
    </DashboardShell>
  );
}
