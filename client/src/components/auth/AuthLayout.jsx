"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children, title, subtitle, badge }) {
  return (
    <div className="min-h-screen bg-[#fcfaf5] text-[#1a3300] flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-[#ffe95c] selection:text-[#1a3300]">
      {/* Top Header Bar */}
      <header className="max-w-[1200px] w-full mx-auto flex items-center justify-between py-2">
        {/* Brand Logo Lockup */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#ffe95c] rounded-[8px] flex items-center justify-center border border-[#1a3300]/15 transition-transform group-hover:scale-105">
            <span className="font-bold text-[#1a3300] text-lg tracking-tight font-mono">
              SP
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[20px] text-[#1a3300] tracking-tight leading-none">
              SkillPulse
            </span>
            <span className="text-[10px] font-mono text-[#1a3300]/60 tracking-wider uppercase mt-0.5">
              LMS Platform
            </span>
          </div>
        </Link>

        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[#1a3300]/80 hover:text-[#1a3300] border border-[#b6b6b6]/60 hover:border-[#1a3300] px-3.5 py-1.5 rounded-[6px] transition-colors bg-[#fcfaf5]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center py-10 sm:py-14">
        <div className="w-full max-w-[560px]">
          {/* Card Headings */}
          <div className="text-center mb-8">
            {badge && (
              <div className="inline-block bg-[#ffe95c] border border-[#1a3300]/15 px-3 py-0.5 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider shadow-[rgba(0,0,0,0.03)_0px_1px_2px]">
                {badge}
              </div>
            )}
            {title && (
              <h1
                className="text-[34px] sm:text-[42px] font-[800] text-[#1a3300] leading-tight tracking-[0.03em] mb-2"
                style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-[16px] text-[#1a3300]/80 max-w-[440px] mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form / Content Card */}
          {children}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-[1200px] w-full mx-auto text-center py-4 border-t border-[#b6b6b6]/30 text-[12px] font-mono text-[#1a3300]/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} SkillPulse LMS. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-[#1a3300] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[#1a3300] transition-colors">
            Terms of Service
          </Link>
          <Link href="/help" className="hover:text-[#1a3300] transition-colors">
            Help & Support
          </Link>
        </div>
      </footer>
    </div>
  );
}
