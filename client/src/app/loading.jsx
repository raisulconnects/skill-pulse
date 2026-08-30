import React from "react";
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fcfaf5] text-[#1a3300] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#1a3300 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-[400px]">
        {/* Animated Brand Badge */}
        <div className="w-16 h-16 bg-[#ffe95c] border-2 border-[#1a3300] rounded-[14px] flex items-center justify-center mb-6 shadow-[rgba(0,0,0,0.06)_0px_4px_12px] animate-pulse-subtle">
          <span
            className="font-bold text-[#1a3300] text-2xl font-mono tracking-tight"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            SP
          </span>
        </div>

        {/* Loading Title */}
        <h2
          className="text-[22px] font-[800] text-[#1a3300] mb-2 tracking-tight"
          style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
        >
          Loading SkillPulse...
        </h2>

        <p className="text-[13px] font-mono text-[#1a3300]/60 mb-6 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#1a3300] animate-spin" />
          <span>Fetching curriculum & state...</span>
        </p>

        {/* Custom Highlighter Progress Loader */}
        <div className="w-full h-2 bg-[#1a3300]/10 rounded-full overflow-hidden border border-[#1a3300]/20 max-w-[280px]">
          <div className="h-full bg-[#1a3300] rounded-full animate-pulse transition-all duration-300 w-3/4" />
        </div>

        {/* Skeleton Grid Mockup */}
        <div className="w-full mt-10 space-y-3 opacity-60">
          <div className="h-4 bg-[#1a3300]/10 rounded-[4px] w-3/4 mx-auto animate-pulse" />
          <div className="h-3 bg-[#1a3300]/5 rounded-[4px] w-1/2 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}
