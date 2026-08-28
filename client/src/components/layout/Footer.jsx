"use client";

import Link from "next/link";
import { ArrowRight, Github, Twitter, Linkedin, Sparkles } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerNav = {
    learn: [
      { name: "All Courses", href: "/courses" },
      { name: "Full-Stack Roadmap", href: "#paths" },
      { name: "AI Engineering", href: "#paths" },
      { name: "System Design", href: "#paths" },
      { name: "Free Starter Pack", href: "/courses?filter=free" },
    ],
    platform: [
      { name: "Interactive Quizzes", href: "#quizzes" },
      { name: "Code Playgrounds", href: "/sandbox" },
      { name: "Verified Certificates", href: "/certificates" },
      { name: "Progress Analytics", href: "/dashboard" },
      { name: "Community Forum", href: "/community" },
    ],
    company: [
      { name: "About SkillPulse", href: "/about" },
      { name: "Instructor Portal", href: "/teach" },
      { name: "Enterprise Plans", href: "/enterprise" },
      { name: "Careers", href: "/careers" },
      { name: "Changelog", href: "/changelog" },
    ],
  };

  return (
    <footer className="w-full bg-[#fcfaf5] border-t border-[#b6b6b6]/50 pt-16 pb-12 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#b6b6b6]/40">
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-[#ffe95c] rounded-[6px] flex items-center justify-center border border-[#1a3300]/15">
                  <span className="font-bold text-[#1a3300] text-base font-mono">SP</span>
                </div>
                <span className="font-bold text-[22px] text-[#1a3300] tracking-tight">
                  SkillPulse
                </span>
              </Link>
              <p className="text-[15px] text-[#1a3300]/80 max-w-[360px] leading-relaxed mb-6">
                The modern full-stack Learning Management System designed to help developers master real skills through interactive code, tests, and paths.
              </p>
            </div>

            {/* Newsletter input */}
            <div className="max-w-[360px]">
              <span className="text-[12px] font-mono uppercase tracking-wider text-[#1a3300]/70 block mb-2 font-semibold">
                Weekly Tech Digest & New Challenges
              </span>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="name@work-email.com"
                  className="bg-[#fcfaf5] border border-[#1a3300] rounded-[6px] px-3.5 py-2 text-[14px] text-[#1a3300] placeholder:text-[#1a3300]/40 flex-1 focus:outline-none focus:ring-2 focus:ring-[#1a3300]/20"
                />
                <button
                  type="submit"
                  className="bg-[#1a3300] text-[#fcfaf5] text-[13px] font-medium px-4 py-2 rounded-[6px] hover:bg-[#1a3300]/90 transition-colors"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[12px] font-mono uppercase tracking-wider text-[#1a3300] font-bold mb-4">
                Curriculum
              </h4>
              <ul className="space-y-2.5">
                {footerNav.learn.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-[14px] text-[#1a3300]/80 hover:text-[#1a3300] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[12px] font-mono uppercase tracking-wider text-[#1a3300] font-bold mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5">
                {footerNav.platform.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-[14px] text-[#1a3300]/80 hover:text-[#1a3300] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[12px] font-mono uppercase tracking-wider text-[#1a3300] font-bold mb-4">
                Organization
              </h4>
              <ul className="space-y-2.5">
                {footerNav.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-[14px] text-[#1a3300]/80 hover:text-[#1a3300] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] font-mono text-[#1a3300]/60">
          <p>© {currentYear} SkillPulse LMS. Built with Next.js & Tailwind CSS.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#1a3300] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#1a3300] transition-colors">
              Terms of Service
            </Link>
            <Link href="/security" className="hover:text-[#1a3300] transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
