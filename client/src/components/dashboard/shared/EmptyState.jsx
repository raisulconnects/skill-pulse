import React from "react";
import { FolderOpen } from "lucide-react";

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = "No data found",
  description = "There are no items to display at this time.",
  actionText,
  onActionClick,
}) {
  return (
    <div className="border border-dashed border-[#1a3300]/30 rounded-[12px] p-8 text-center bg-[#fcfaf5] flex flex-col items-center justify-center my-4">
      <div className="w-12 h-12 rounded-full bg-[#ffe95c]/40 border border-[#1a3300]/10 flex items-center justify-center text-[#1a3300] mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3
        className="text-[18px] font-bold text-[#1a3300] mb-1"
        style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
      >
        {title}
      </h3>
      <p className="text-[14px] text-[#1a3300]/70 max-w-[360px] mb-4">
        {description}
      </p>
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="bg-[#1a3300] text-[#fcfaf5] px-4 py-2 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/90 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
