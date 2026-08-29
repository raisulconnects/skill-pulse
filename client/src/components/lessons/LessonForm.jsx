"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Video,
  Hash,
  ArrowLeft,
  Save,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Link as LinkIcon,
  CloudUpload,
  FileVideo,
} from "lucide-react";

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

  // Video Upload States
  const [uploadMode, setUploadMode] = useState("file"); // "file" or "url"
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVideoFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setUploadError("Please select a valid video file (.mp4, .mov, .webm, .avi, .mkv).");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadProgress(20);
    setUploadedFileName(file.name);

    try {
      const data = new FormData();
      data.append("file", file);

      setUploadProgress(45);

      const res = await fetch("/api/upload/video", {
        method: "POST",
        body: data,
      });

      setUploadProgress(85);

      const result = await res.json();

      if (res.ok && result.url) {
        setFormData((prev) => ({ ...prev, video_url: result.url }));
        setUploadProgress(100);
      } else {
        setUploadError(result.error || result.details || "Failed to upload video to Cloudinary.");
        setUploadedFileName("");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Network or server error during video upload.");
      setUploadedFileName("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    setFormData((prev) => ({ ...prev, video_url: "" }));
    setUploadedFileName("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Lesson title is required.";
    if (formData.lesson_order === "" || isNaN(formData.lesson_order)) {
      errs.lesson_order = "Valid lesson order index is required.";
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

  const hasVideoUrl = !!formData.video_url?.trim();

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

        {/* Video Upload / URL Section */}
        <div className="space-y-2.5 pt-2 border-t border-[#b6b6b6]/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-[13px] font-medium text-[#1a3300]">
                Lesson Video <span className="text-[#1a3300]/50 font-normal">(Optional)</span>
              </label>
              <p className="text-[11px] font-mono text-[#1a3300]/60">
                Upload a video file to Cloudinary or provide a direct video link
              </p>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-1 bg-[#1a3300]/5 border border-[#1a3300]/15 p-1 rounded-[6px] self-start sm:self-auto font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
                  uploadMode === "file"
                    ? "bg-[#1a3300] text-[#fcfaf5]"
                    : "text-[#1a3300]/70 hover:text-[#1a3300]"
                }`}
              >
                <CloudUpload className="w-3 h-3" />
                <span>Upload Video</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
                  uploadMode === "url"
                    ? "bg-[#1a3300] text-[#fcfaf5]"
                    : "text-[#1a3300]/70 hover:text-[#1a3300]"
                }`}
              >
                <LinkIcon className="w-3 h-3" />
                <span>Video URL</span>
              </button>
            </div>
          </div>

          {/* Existing Video Attached Badge */}
          {hasVideoUrl && (
            <div className="bg-[#d5f5c2]/40 border border-[#1a3300]/20 rounded-[10px] p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#1a3300] text-[#ffe95c] flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-mono font-bold text-[#1a3300]">
                      Video Attached ✓
                    </span>
                    {uploadedFileName && (
                      <span className="text-[11px] font-mono text-[#1a3300]/60 truncate">
                        ({uploadedFileName})
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-[#1a3300]/70 truncate max-w-[450px]">
                    {formData.video_url}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-[11px] font-mono font-medium text-[#1a3300] bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[5px] hover:bg-[#ffe95c] transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="px-2.5 py-1 text-[11px] font-mono font-medium text-[#cb5521] bg-[#fcd0d0]/50 border border-[#cb5521]/30 rounded-[5px] hover:bg-[#fcd0d0] transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}

          {/* Upload File Input Area */}
          {uploadMode === "file" && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/mkv"
                onChange={handleVideoFileSelect}
                disabled={isUploading}
                className="hidden"
                id="cloudinary-video-input"
              />

              <label
                htmlFor="cloudinary-video-input"
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[12px] cursor-pointer transition-all ${
                  isUploading
                    ? "border-[#1a3300]/30 bg-[#1a3300]/5 cursor-not-allowed"
                    : "border-[#1a3300]/30 bg-[#fcfaf5] hover:border-[#1a3300] hover:bg-[#1a3300]/5"
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-2 py-2">
                    <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin" />
                    <span className="text-[13px] font-mono font-bold text-[#1a3300]">
                      Uploading video to Cloudinary... ({uploadProgress}%)
                    </span>
                    <p className="text-[11px] font-mono text-[#1a3300]/60">
                      Processing video file. Please wait...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#ffe95c] border border-[#1a3300]/20 flex items-center justify-center text-[#1a3300] mb-1">
                      <CloudUpload className="w-5 h-5" />
                    </div>
                    <span className="text-[14px] font-bold text-[#1a3300]">
                      {hasVideoUrl ? "Click to Replace Video File" : "Click or Drag to Upload Lesson Video"}
                    </span>
                    <span className="text-[11px] font-mono text-[#1a3300]/60">
                      Supports MP4, MOV, WEBM, AVI (Cloudinary hosted)
                    </span>
                  </div>
                )}
              </label>

              {uploadError && (
                <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-3 flex items-center gap-2 text-[#cb5521] text-[13px]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-mono text-[12px]">{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* Manual URL Input Area */}
          {uploadMode === "url" && (
            <div className="space-y-1.5">
              <div className="relative">
                <Video className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1a3300]/50" />
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  placeholder="https://res.cloudinary.com/... or https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[8px] pl-9 pr-3 py-2.5 text-[14px] text-[#1a3300] focus:outline-none focus:border-[#1a3300] transition-colors font-mono text-[13px]"
                />
              </div>
              <p className="text-[11px] text-[#1a3300]/60 font-mono">
                Paste a Cloudinary video URL or YouTube/Vimeo video embed link.
              </p>
            </div>
          )}
        </div>

        {/* Description / Content */}
        <div className="space-y-1.5 pt-2 border-t border-[#b6b6b6]/30">
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
          disabled={isSubmitting || isUploading}
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
