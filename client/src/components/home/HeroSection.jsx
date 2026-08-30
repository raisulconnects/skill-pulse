"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Code2, BookOpen, CheckCircle2, Terminal } from "lucide-react";
import Prism from "@/components/ui/Prism";

export default function HeroSection() {
  return (
    <section className="relative w-full pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Prism Background (React Bits) */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30 mix-blend-multiply overflow-hidden" 
        aria-hidden="true"
      >
        <Prism
          animationType="rotate"
          timeScale={0.35}
          height={3.5}
          baseWidth={5.5}
          scale={3.4}
          hueShift={0.2}
          colorFrequency={1.2}
          noise={0.3}
          glow={0.8}
          bloom={0.9}
          transparent={true}
          suspendWhenOffscreen={true}
        />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 bg-[#ffe95c] border border-[#1a3300]/15 px-3 py-1 rounded-[6px] text-[12px] sm:text-[13px] font-medium text-[#1a3300] mb-6 shadow-[rgba(0,0,0,0.03)_0px_1px_2px] animate-float">
          <Sparkles className="w-3.5 h-3.5 text-[#1a3300] animate-pulse-subtle" />
          <span className="font-mono uppercase tracking-wider">The Interactive Tech LMS</span>
        </div>

        {/* Display Headline in Bricolage Grotesque */}
        <h1 
          className="font-bricolage text-[#1a3300] text-[46px] sm:text-[62px] lg:text-[76px] font-[800] leading-[1.05] tracking-[0.04em] max-w-[950px] mb-6 animate-slide-up"
          style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
        >
          Master tech skills{" "}
          <span className="bg-[#ffe95c] px-3 py-0.5 rounded-[4px] inline-block -rotate-1 shadow-[rgba(0,0,0,0.05)_0px_1px_2px] hover:rotate-0 transition-transform duration-300">
            faster
          </span>{" "}
          with hands-on courses & quizzes.
        </h1>

        {/* Subhead Paragraph */}
        <p className="text-[17px] sm:text-[19px] lg:text-[20px] text-[#1a3300]/85 leading-[1.5] max-w-[640px] mb-8 font-normal animate-slide-up" style={{ animationDelay: '100ms' }}>
          SkillPulse is the modern learning platform designed for ambitious builders. 
          Discover curated tracks, test your code live, track your progress, and earn verified skill credentials.
        </p>

        {/* CTA Stack */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-5">
          <Link
            href="/dashboard/courses"
            className="btn-interactive w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] text-[16px] font-medium px-8 py-4 rounded-[6px] hover:bg-[#1a3300]/95 group shadow-sm"
          >
            <span>Explore All Courses</span>
            <ArrowRight className="w-5 h-5 text-[#ffe95c] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/blog"
            className="btn-interactive w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#d5f5c2] border border-[#1a3300] text-[#1a3300] text-[16px] font-medium px-8 py-4 rounded-[6px] hover:bg-[#d5f5c2]/90"
          >
            <BookOpen className="w-4 h-4 text-[#1a3300]" />
            <span>Read Blog & Articles</span>
          </Link>
        </div>

        {/* Reassurance Microcopy */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[13px] text-[#1a3300]/70 font-mono mb-16">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1a3300]" />
            50+ Free Starter Lessons
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1a3300]" />
            No Credit Card Required
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1a3300]" />
            Verified Completion Badges
          </span>
        </div>

        {/* Backed-by / Partner Logo Strip */}
        <div className="w-full pt-8 border-t border-[#b6b6b6]/40">
          <p className="text-[12px] font-mono uppercase tracking-widest text-[#1a3300]/60 mb-6 text-center">
            Trusted by 45,000+ developers and teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80 grayscale hover:grayscale-0 transition-all duration-300">
            {["Vercel", "Stripe", "Supabase", "Linear", "Figma", "GitHub"].map((company) => (
              <span
                key={company}
                className="font-bold text-[18px] sm:text-[20px] text-[#1a3300] tracking-tight hover:text-[#1a3300] transition-colors"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
