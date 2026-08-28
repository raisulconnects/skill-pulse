import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeader({
  title,
  subtitle,
  badge,
  badgeBg = "bg-[#ffe95c]",
  actionText,
  actionHref,
  onActionClick,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {badge && (
            <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-[4px] border border-[#1a3300]/15 text-[#1a3300] uppercase tracking-wider ${badgeBg}`}>
              {badge}
            </span>
          )}
          <h2
            className="text-[20px] sm:text-[24px] font-[800] text-[#1a3300] tracking-tight"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-[14px] text-[#1a3300]/75">{subtitle}</p>
        )}
      </div>

      {(actionText && (actionHref || onActionClick)) && (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1a3300] border border-[#1a3300] rounded-[6px] px-3.5 py-1.5 hover:bg-[#1a3300]/5 transition-colors self-start sm:self-auto"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <button
            onClick={onActionClick}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1a3300] border border-[#1a3300] rounded-[6px] px-3.5 py-1.5 hover:bg-[#1a3300]/5 transition-colors self-start sm:self-auto"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )
      )}
    </div>
  );
}
