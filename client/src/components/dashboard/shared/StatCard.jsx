import React from "react";
import { TrendingUp, Sparkles } from "lucide-react";

const VARIANT_SURFACES = {
  mint: "bg-[#d5f5c2]",
  yellow: "bg-[#ffe95c]",
  teal: "bg-[#a8e5e5]",
  blush: "bg-[#f6d0ff]",
  cream: "bg-[#fcfaf5]",
};

export default function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  variant = "cream",
}) {
  const surfaceClass = VARIANT_SURFACES[variant] || VARIANT_SURFACES.cream;

  return (
    <div
      className={`border border-[#1a3300]/25 rounded-[12px] p-5 ${surfaceClass} card-hover-lift group shadow-[rgba(0,0,0,0.04)_0px_2px_4px]`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-mono text-[#1a3300]/75 uppercase tracking-wider">
          {label}
        </span>
        {Icon ? (
          <div className="w-8 h-8 rounded-[6px] bg-[#1a3300]/10 flex items-center justify-center text-[#1a3300] group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-4 h-4" />
          </div>
        ) : (
          <Sparkles className="w-4 h-4 text-[#1a3300]/50 group-hover:rotate-12 transition-transform duration-300" />
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span
          className="text-[28px] sm:text-[32px] font-[800] text-[#1a3300] leading-none"
          style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
        >
          {value}
        </span>
        {trend && (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#1a3300]/80 bg-[#1a3300]/10 px-2 py-0.5 rounded-[4px]">
            <TrendingUp className="w-3 h-3 text-[#1a3300]" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
