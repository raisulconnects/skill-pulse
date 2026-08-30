import Link from "next/link";
import { ArrowRight, Sparkles, Code, CheckCircle } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="py-16 md:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#1a3300] text-[#fcfaf5] rounded-[16px] p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-[rgba(0,0,0,0.1)_0px_8px_24px]">
        {/* Subtle decorative background border pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffe95c 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-[760px] mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-[#ffe95c] text-[#1a3300] px-3.5 py-1 rounded-[6px] text-[12px] font-mono font-bold mb-6 animate-float">
            <Sparkles className="w-3.5 h-3.5 text-[#1a3300] animate-pulse-subtle" />
            <span>START FOR FREE TODAY</span>
          </div>

          <h2
            className="text-[34px] sm:text-[48px] md:text-[56px] font-[800] leading-[1.08] tracking-[0.03em] mb-6 text-[#fcfaf5]"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            Ready to pulse your skills to the{" "}
            <span className="text-[#ffe95c] underline decoration-[#ffe95c]/60 underline-offset-8">
              next level
            </span>
            ?
          </h2>

          <p className="text-[17px] sm:text-[19px] text-[#fcfaf5]/85 leading-relaxed max-w-[600px] mb-8 font-normal">
            Join over 45,000 developers building practical, portfolio-grade projects, cracking quizzes, and landing engineering roles.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-6">
            <Link
              href="/register"
              className="btn-interactive w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#ffe95c] text-[#1a3300] font-bold text-[16px] px-9 py-4 rounded-[6px] hover:bg-[#ffe95c]/95 group shadow-md"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-5 h-5 text-[#1a3300] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard/courses"
              className="btn-interactive w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-[#fcfaf5]/40 text-[#fcfaf5] text-[16px] font-medium px-8 py-4 rounded-[6px] hover:bg-[#fcfaf5]/10"
            >
              <span>Explore Curriculum</span>
            </Link>
          </div>

          <p className="text-[13px] font-mono text-[#fcfaf5]/60">
            No credit card required. Free tier includes access to 50+ lessons & community quizzes.
          </p>
        </div>
      </div>
    </section>
  );
}
