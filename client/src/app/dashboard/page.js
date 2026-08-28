"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Shield, BookOpen, Sparkles, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfaf5] flex flex-col items-center justify-center text-[#1a3300]">
        <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mb-4" />
        <p className="font-mono text-[14px]">Restoring session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcfaf5] flex flex-col items-center justify-center p-6 text-center text-[#1a3300]">
        <div className="max-w-[420px] bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-8 shadow-md">
          <div className="w-12 h-12 bg-[#fcd0d0] text-[#cb5521] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h1
            className="text-[28px] font-bold mb-2"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            Authentication Required
          </h1>
          <p className="text-[15px] text-[#1a3300]/80 mb-6">
            Please log in or create an account to access the SkillPulse learning dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full bg-[#1a3300] text-[#fcfaf5] py-3 rounded-[6px] font-medium hover:bg-[#1a3300]/90 transition-colors"
            >
              Go to Sign In
            </Link>
            <Link
              href="/"
              className="text-[14px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf5] text-[#1a3300] flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-[#b6b6b6]/40 bg-[#fcfaf5]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#ffe95c] rounded-[6px] flex items-center justify-center border border-[#1a3300]/15">
              <span className="font-bold text-[#1a3300] text-base font-mono">SP</span>
            </div>
            <span className="font-bold text-[20px] text-[#1a3300] tracking-tight">
              SkillPulse
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[13px] font-mono text-[#1a3300]/70">Logged in as:</span>
              <span className="text-[13px] font-bold text-[#1a3300]">
                {user.username || user.email}
              </span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1a3300] border border-[#1a3300] rounded-[6px] px-3.5 py-1.5 hover:bg-[#1a3300]/5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Welcome */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-10 shadow-[rgba(0,0,0,0.06)_0px_4px_12px] mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#b6b6b6]/40">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#ffe95c] px-3 py-0.5 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Active Session</span>
              </div>
              <h1
                className="text-[32px] sm:text-[40px] font-[800] text-[#1a3300] leading-tight tracking-[0.02em] mb-2"
                style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
              >
                Welcome back,{" "}
                <span className="marker-highlight">
                  {user.username || user.email.split("@")[0]}
                </span>
                !
              </h1>
              <p className="text-[16px] text-[#1a3300]/80">
                You are successfully authenticated in SkillPulse.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1 font-mono text-[13px]">
              <span className="text-[#1a3300]/60">Assigned User Role:</span>
              <span
                className={`px-3 py-1 rounded-[6px] font-bold border border-[#1a3300]/20 uppercase ${
                  user.user_role === "instructor"
                    ? "bg-[#ffe95c] text-[#1a3300]"
                    : "bg-[#d5f5c2] text-[#1a3300]"
                }`}
              >
                {user.user_role === "instructor" ? "✨ Instructor" : "🎓 Student"}
              </span>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[8px] p-4">
              <span className="text-[11px] font-mono text-[#1a3300]/60 block mb-1">Email</span>
              <span className="font-medium text-[15px]">{user.email}</span>
            </div>
            <div className="bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[8px] p-4">
              <span className="text-[11px] font-mono text-[#1a3300]/60 block mb-1">Username</span>
              <span className="font-medium text-[15px]">@{user.username}</span>
            </div>
            <div className="bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[8px] p-4">
              <span className="text-[11px] font-mono text-[#1a3300]/60 block mb-1">Status</span>
              <span className="font-medium text-[15px] text-[#1a3300] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1a3300]" />
                Authenticated
              </span>
            </div>
          </div>
        </div>

        {/* Next step prompt */}
        <div className="bg-[#d5f5c2] border-2 border-[#1a3300] rounded-[14px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[18px] text-[#1a3300] mb-1">
              Ready to continue your learning journey?
            </h3>
            <p className="text-[14px] text-[#1a3300]/85">
              Explore your courses or take an interactive skill test.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-2.5 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-colors"
          >
            <span>Explore Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
