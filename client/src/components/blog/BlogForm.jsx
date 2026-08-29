"use client";

import React, { useState } from "react";
import { FileText, Image as ImageIcon, Send, Save, EyeOff, Sparkles } from "lucide-react";

export default function BlogForm({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  isEdit = false,
}) {
  // Extract initial text description if Strapi blocks format or string
  let initialDescription = "";
  if (typeof initialData?.description === "string") {
    initialDescription = initialData.description;
  } else if (Array.isArray(initialData?.description)) {
    initialDescription = initialData.description
      .map((block) => block?.children?.map((c) => c.text).join("") || "")
      .join("\n\n");
  }

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialDescription);
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialData?.cover_image_url || initialData?.cover_image?.url || ""
  );
  const [currentStatus, setCurrentStatus] = useState(initialData?.post_status || "draft");

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = "Blog title is required.";
    }
    if (!description.trim()) {
      errs.description = "Blog body content is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (targetStatus) => {
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      cover_image_url: coverImageUrl.trim(),
      post_status: targetStatus,
    };

    onSubmit(payload);
  };

  const isPublished = currentStatus === "published";

  return (
    <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[16px] p-6 sm:p-8 shadow-sm space-y-6 text-[#1a3300]">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="block text-[13px] font-bold text-[#1a3300]">
          Blog Title <span className="text-[#cb5521]">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Mastering Next.js Server Components in 2026"
          className={`w-full bg-white border rounded-[8px] px-4 py-2.5 text-[14px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3300]/30 transition-all ${
            errors.title ? "border-[#cb5521]" : "border-[#1a3300]/25"
          }`}
        />
        {errors.title && (
          <p className="text-[12px] font-mono text-[#cb5521] mt-1">{errors.title}</p>
        )}
      </div>

      {/* Cover Image URL (Optional) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[13px] font-bold text-[#1a3300]">
            Cover Image URL <span className="text-[11px] font-mono font-normal text-[#1a3300]/60">(Optional)</span>
          </label>
          {coverImageUrl.trim() && (
            <span className="text-[11px] font-mono text-[#1a3300]/70 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" /> Preview available
            </span>
          )}
        </div>
        <input
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
          className="w-full bg-white border border-[#1a3300]/25 rounded-[8px] px-4 py-2.5 text-[14px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3300]/30 transition-all font-mono text-[13px]"
        />
        {coverImageUrl.trim() && (
          <div className="mt-2 h-36 rounded-[8px] overflow-hidden border border-[#1a3300]/20 bg-[#1a3300]/5 relative">
            <img
              src={coverImageUrl}
              alt="Cover Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* Body / Description */}
      <div className="space-y-1.5">
        <label className="block text-[13px] font-bold text-[#1a3300]">
          Blog Content / Body <span className="text-[#cb5521]">*</span>
        </label>
        <textarea
          rows={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write your article content here..."
          className={`w-full bg-white border rounded-[8px] p-4 text-[14px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3300]/30 transition-all font-sans leading-relaxed ${
            errors.description ? "border-[#cb5521]" : "border-[#1a3300]/25"
          }`}
        />
        {errors.description && (
          <p className="text-[12px] font-mono text-[#cb5521] mt-1">{errors.description}</p>
        )}
      </div>

      {/* Current Publishing Status Indicator */}
      <div className="pt-2 border-t border-[#b6b6b6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-mono text-[#1a3300]/70">Publishing State:</span>
          <span
            className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-[4px] border uppercase ${
              isPublished
                ? "bg-[#d5f5c2] border-[#1a3300]/20 text-[#1a3300]"
                : "bg-[#ffe95c] border-[#1a3300]/30 text-[#1a3300]"
            }`}
          >
            {isPublished ? "Published" : "Draft (Private)"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {!isEdit ? (
            <>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleFormSubmit("draft")}
                className="inline-flex items-center justify-center gap-2 bg-[#fcfaf5] text-[#1a3300] border border-[#1a3300] px-5 py-2.5 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/5 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#1a3300]" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleFormSubmit("published")}
                className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-6 py-2.5 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/90 transition-all shadow-xs disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#ffe95c]" />
                <span>Publish Post</span>
              </button>
            </>
          ) : (
            <>
              {isPublished ? (
                <>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleFormSubmit("draft")}
                    className="inline-flex items-center justify-center gap-2 bg-[#ffe95c]/40 text-[#1a3300] border border-[#1a3300]/30 px-4 py-2.5 rounded-[6px] text-[13px] font-medium hover:bg-[#ffe95c] transition-all disabled:opacity-50"
                  >
                    <EyeOff className="w-4 h-4 text-[#1a3300]" />
                    <span>Unpublish (Move to Draft)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleFormSubmit("published")}
                    className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-6 py-2.5 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/90 transition-all shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-[#ffe95c]" />
                    <span>Update Post</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleFormSubmit("draft")}
                    className="inline-flex items-center justify-center gap-2 bg-[#fcfaf5] text-[#1a3300] border border-[#1a3300] px-4 py-2.5 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/5 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-[#1a3300]" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleFormSubmit("published")}
                    className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-6 py-2.5 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/90 transition-all shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-[#ffe95c]" />
                    <span>Publish Now</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
