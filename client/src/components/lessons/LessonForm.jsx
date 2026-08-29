"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Video, Hash, FileText, ArrowLeft, Save } from "lucide-react";

export default function LessonForm({
  initialData = {},
  courseTitle = "Course",
  courseId,
  onSubmit,
  isSubmitting = false,
  isEdit = false,
}) {
  // Extract description string from blocks if blocks array passed
  let defaultDescription = "";
  if (typeof initialData.description === "string") {
    defaultDescription = initialData.description;
  } else if (Array.isArray(initialData.description)) {
    defaultDescription = initialData.description
      .map((block) => block?.children?.map((c) => c.text).join("") || "")
      .join("\n\n");
  }

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    lesson_order: initialData.lesson_order ?? 1,
    video_url: initialData.video_url || "",
    description: defaultDescription,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Lesson title is required.";
    if (formData.lesson_order === "" || isNaN(formData.lesson_order)) {
      errs.lesson_order = "Valid lesson order is required.";
    }
    if (!formData.description.trim()) errs.description = "Lesson description is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      lesson_order: parseInt(formData.lesson_order, 10),
      course: courseId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-[800px]">
      {/* Contextual Course Header */}
      <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#d5f5c2] border border-[#1a3300]/20 flex items-center justify-center text-[#1a3300] shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase tracking-wider block">
              Associated Course
            </span>
            <h4
              className="text-[15px] font-bold text-[#1a3300]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              {courseTitle}
            </h4>
          </div>
        </div>

        <Link
          href={`/dashboard/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Course</span>
        </Link>
      </div>

      {/* Main Form Fields */}
      <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[16px] p-6 space-y-5 shadow-sm">
        {/* Title & Order Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-[13px] font-medium text-[#1a3300]">
              Lesson Title <span className="text-[#cb5521]">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to Component Architecture"
              className={`w-full bg-[#fcfaf5] border ${
                errors.title ? "border-[#cb5521]" : "border-[#1a3300]/30"
              } rounded-[8px] px-3.5 py-2.5 text-[14px] text-[#1a3300] focus:outline-none focus:border-[#1a3300] transition-colors`}
            />
            {errors.title && (
              <p className="text-[12px] font-mono text-[#cb5521]">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#1a3300]">
              Order Index <span className="text-[#cb5521]">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1a3300]/50" />
              <input
                type="number"
                name="lesson_order"
                min="1"
                value={formData.lesson_order}
                onChange={handleChange}
                className={`w-full bg-[#fcfaf5] border ${
                  errors.lesson_order ? "border-[#cb5521]" : "border-[#1a3300]/30"
                } rounded-[8px] pl-9 pr-3 py-2.5 text-[14px] font-mono text-[#1a3300] focus:outline-none focus:border-[#1a3300] transition-colors`}
              />
            </div>
            {errors.lesson_order && (
              <p className="text-[12px] font-mono text-[#cb5521]">{errors.lesson_order}</p>
            )}
          </div>
        </div>

        {/* Video URL (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[13px] font-medium text-[#1a3300]">
              Video URL <span className="text-[#1a3300]/50 font-normal">(Optional)</span>
            </label>
            <span className="text-[11px] font-mono text-[#1a3300]/60">
              YouTube, MP4, or Video Embed Link
            </span>
          </div>
          <div className="relative">
            <Video className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1a3300]/50" />
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=... or https://cdn.example.com/video.mp4"
              className="w-full bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[8px] pl-9 pr-3 py-2.5 text-[14px] text-[#1a3300] focus:outline-none focus:border-[#1a3300] transition-colors placeholder:text-[#1a3300]/35 font-mono text-[13px]"
            />
          </div>
          <p className="text-[11px] text-[#1a3300]/60 font-mono">
            Leave blank if this lesson is text/reading material only.
          </p>
        </div>

        {/* Description / Content */}
        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-[#1a3300]">
            Lesson Content / Description <span className="text-[#cb5521]">*</span>
          </label>
          <textarea
            name="description"
            rows={7}
            value={formData.description}
            onChange={handleChange}
            placeholder="Write the lesson content, key concepts, instructions, or reading materials..."
            className={`w-full bg-[#fcfaf5] border ${
              errors.description ? "border-[#cb5521]" : "border-[#1a3300]/30"
            } rounded-[8px] p-3.5 text-[14px] text-[#1a3300] focus:outline-none focus:border-[#1a3300] transition-colors leading-relaxed`}
          />
          {errors.description && (
            <p className="text-[12px] font-mono text-[#cb5521]">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="px-5 py-2.5 rounded-[6px] text-[14px] font-medium text-[#1a3300] bg-[#1a3300]/5 border border-[#1a3300]/20 hover:bg-[#1a3300]/10 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-6 py-2.5 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-[#fcfaf5] border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#ffe95c]" />
              <span>{isEdit ? "Update Lesson" : "Create Lesson"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
