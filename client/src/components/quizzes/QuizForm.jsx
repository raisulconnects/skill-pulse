"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, HelpCircle, AlertCircle } from "lucide-react";

export default function QuizForm({
  initialData = {},
  courseTitle = "Course",
  courseId,
  onSubmit,
  isSubmitting = false,
  isEdit = false,
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({ title: initialData.title || "" });
    setErrors({});
  }, [initialData.title]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Quiz title is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ title: formData.title.trim() });
  };

  return (
    <div className="max-w-[640px]">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {courseTitle}</span>
        </Link>
      </div>

      {/* Form card */}
      <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#b6b6b6]/30">
          <div className="w-10 h-10 rounded-[8px] bg-[#ffe95c] border border-[#1a3300]/20 flex items-center justify-center text-[#1a3300]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2
              className="text-[20px] font-bold text-[#1a3300]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              {isEdit ? "Edit Quiz" : "Create New Quiz"}
            </h2>
            <p className="text-[12px] font-mono text-[#1a3300]/60">
              Course: {courseTitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[12px] font-mono font-medium text-[#1a3300] uppercase tracking-wider mb-1.5">
              Quiz Title <span className="text-[#cb5521]">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors((prev) => { const n = { ...prev }; delete n.title; return n; });
              }}
              placeholder="e.g. Module 1 Assessment"
              className={`w-full bg-white border rounded-[8px] px-4 py-3 text-[14px] text-[#1a3300] placeholder-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3300]/30 transition-all ${
                errors.title ? "border-[#cb5521]" : "border-[#1a3300]/30"
              }`}
            />
            {errors.title && (
              <p className="flex items-center gap-1 mt-1.5 text-[12px] font-mono text-[#cb5521]">
                <AlertCircle className="w-3 h-3" /> {errors.title}
              </p>
            )}
          </div>

          {/* Info note */}
          <div className="bg-[#d5f5c2]/40 border border-[#1a3300]/20 rounded-[8px] p-3">
            <p className="text-[12px] font-mono text-[#1a3300]/70 leading-relaxed">
              The quiz will be automatically linked to this course. After creating the quiz, you can add up to <strong>10 questions</strong> from the quiz management page.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#b6b6b6]/30">
            <Link
              href={`/dashboard/courses/${courseId}`}
              className="px-4 py-2 rounded-[6px] text-[13px] font-medium text-[#1a3300] bg-[#1a3300]/5 border border-[#1a3300]/20 hover:bg-[#1a3300]/10 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-[6px] text-[13px] font-medium text-[#fcfaf5] bg-[#1a3300] hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#fcfaf5] border-t-transparent rounded-full animate-spin" />
                  <span>{isEdit ? "Saving..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEdit ? "Save Changes" : "Create Quiz"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
