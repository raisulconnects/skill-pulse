"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Sparkles, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: "Courses", href: "/#courses" },
    { name: "Blog", href: "/blog" },
    { name: "Quizzes", href: "/#quizzes" },
    { name: "Features", href: "/#features" },
    { name: "Community", href: "/#community" },
  ];

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
      <nav
        aria-label="Main Navigation"
        className="bg-[#fcfaf5] border border-[#b6b6b6] rounded-[16px] px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] transition-all"
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#ffe95c] rounded-[8px] flex items-center justify-center border border-[#1a3300]/10 transition-transform group-hover:scale-105">
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

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[14px] font-medium text-[#1a3300] hover:text-[#1a3300] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#1a3300] hover:after:w-full after:transition-all"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="btn-interactive inline-flex items-center gap-1.5 text-[14px] font-medium text-[#1a3300] bg-[#d5f5c2] border border-[#1a3300] rounded-[6px] px-4 py-2 hover:bg-[#d5f5c2]/90 shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-[#1a3300]" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={logout}
                className="text-[13px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] hover:scale-110 transition-transform px-2 py-2"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-interactive text-[14px] font-medium text-[#1a3300] border border-[#1a3300] rounded-[6px] px-4 py-2 hover:bg-[#1a3300]/5"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="btn-interactive inline-flex items-center gap-1.5 text-[14px] font-medium text-[#fcfaf5] bg-[#1a3300] rounded-[6px] px-4 py-2 hover:bg-[#1a3300]/95 group shadow-sm"
              >
                <span>Start Learning</span>
                <ArrowRight className="w-4 h-4 text-[#ffe95c] group-hover:translate-x-1 transition-transform" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#1a3300] rounded-[6px] hover:bg-[#1a3300]/5"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-[#fcfaf5] border border-[#b6b6b6] rounded-[16px] p-4 shadow-lg flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-[15px] font-medium text-[#1a3300] py-2 px-3 rounded-[6px] hover:bg-[#ffe95c]/30 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-[#b6b6b6]/30 my-1" />
          <div className="flex flex-col gap-2 pt-1">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-[14px] font-medium text-[#1a3300] bg-[#d5f5c2] border border-[#1a3300] rounded-[6px] py-2.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-[14px] font-medium text-[#cb5521] border border-[#cb5521]/40 rounded-[6px] py-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-[14px] font-medium text-[#1a3300] border border-[#1a3300] rounded-[6px] py-2.5"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-[14px] font-medium text-[#fcfaf5] bg-[#1a3300] rounded-[6px] py-2.5"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
