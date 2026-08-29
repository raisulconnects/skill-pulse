"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DeleteCourseModal({
  isOpen,
  courseTitle,
  onConfirm,
  onClose,
  isDeleting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1a3300]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-[#1a3300]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#b6b6b6]/30">
          <div className="flex items-center gap-2.5 text-[#cb5521]">
            <div className="w-9 h-9 rounded-full bg-[#fcd0d0] flex items-center justify-center border border-[#cb5521]/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3
              className="text-[18px] font-bold text-[#1a3300]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Delete Course
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#1a3300]/60 hover:text-[#1a3300] rounded-[4px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[14px] text-[#1a3300]/80 mb-2 leading-relaxed">
          Are you sure you want to delete <strong className="font-bold text-[#1a3300]">"{courseTitle}"</strong>?
        </p>
        <p className="text-[12px] font-mono text-[#cb5521] bg-[#fcd0d0]/50 p-2.5 rounded-[6px] border border-[#cb5521]/20 mb-6">
          ⚠️ This action cannot be undone. All associated enrollments and course data will be removed.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-[13px] font-medium text-[#1a3300] border border-[#1a3300]/30 rounded-[6px] hover:bg-[#1a3300]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 text-[13px] font-medium text-[#fcfaf5] bg-[#cb5521] rounded-[6px] hover:bg-[#cb5521]/90 transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
