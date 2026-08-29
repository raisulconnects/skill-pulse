"use client";

import React from "react";
import { AlertTriangle, X, HelpCircle } from "lucide-react";

export default function DeleteQuizModal({
  isOpen,
  quizTitle,
  onConfirm,
  onClose,
  isDeleting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a3300]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] max-w-[440px] w-full p-6 shadow-[rgba(0,0,0,0.15)_0px_8px_24px] relative">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1 rounded-[4px] text-[#1a3300]/60 hover:text-[#1a3300] hover:bg-[#1a3300]/5 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#fcd0d0] border border-[#cb5521] flex items-center justify-center text-[#cb5521] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3
              className="text-[18px] font-bold text-[#1a3300]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Delete Quiz
            </h3>
            <p className="text-[12px] font-mono text-[#1a3300]/60">
              Confirm Action
            </p>
          </div>
        </div>

        <p className="text-[14px] text-[#1a3300]/80 mb-6 leading-relaxed">
          Are you sure you want to delete <strong className="text-[#1a3300]">&ldquo;{quizTitle}&rdquo;</strong>? All questions in this quiz will also be permanently deleted.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#b6b6b6]/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-[6px] text-[13px] font-medium text-[#1a3300] bg-[#1a3300]/5 border border-[#1a3300]/20 hover:bg-[#1a3300]/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-[6px] text-[13px] font-medium text-[#fcfaf5] bg-[#cb5521] border border-[#cb5521] hover:bg-[#cb5521]/90 transition-transform active:scale-[0.98] shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#fcfaf5] border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Yes, Delete Quiz</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
