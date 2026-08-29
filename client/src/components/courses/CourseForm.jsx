"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  "Web Development",
  "UI/UX Design",
  "Backend & Databases",
  "DevOps & Cloud",
  "Data Science & AI",
  "Mobile Development",
  "Cybersecurity",
];

export default function CourseForm({
  initialData = null,
  user,
  onSubmit,
  isSubmitting = false,
  isEdit = false,
}) {
  const userRole = user?.user_role || "student";

  // Initial description extraction (if blocks or string)
  let initialDesc = "";
  if (typeof initialData?.description === "string") {
    initialDesc = initialData.description;
  } else if (Array.isArray(initialData?.description)) {
    initialDesc = initialData.description
      .map((block) => block?.children?.map((c) => c.text).join("") || "")
      .join("\n\n");
  }

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialDesc,
    category: initialData?.category || "Web Development",
    course_status: initialData?.course_status || "published",
    thumbnail_url: initialData?.thumbnail_url || initialData?.thumbnail?.url || "",
    instructor: initialData?.instructor?.id || initialData?.instructor || "",
  });

  const [instructorsList, setInstructorsList] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch instructors for Admin and Content Manager
  useEffect(() => {
    if (userRole === "admin" || userRole === "content_manager") {
      setLoadingInstructors(true);
      fetch("/api/instructors")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setInstructorsList(data);
            if (!formData.instructor && data.length > 0) {
              setFormData((prev) => ({ ...prev, instructor: data[0].id }));
            }
          }
        })
        .catch((err) => console.error("Error fetching instructors:", err))
        .finally(() => setLoadingInstructors(false));
    }
  }, [userRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title.trim()) {
      setFormError("Course title is required.");
      return;
    }

    if (!formData.description.trim()) {
      setFormError("Course description is required.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      course_status: formData.course_status,
      thumbnail_url: formData.thumbnail_url.trim() || undefined,
    };

    // If Admin/Content Manager and selected an instructor
    if (userRole === "admin" || userRole === "content_manager") {
      if (formData.instructor) {
        payload.instructor = formData.instructor;
      }
    } else if (userRole === "instructor") {
      // Backend automatically sets instructor to user.id, but pass for clarity
      payload.instructor = user.id;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-[800px]">
      {/* Error Alert */}
      {formError && (
        <div className="bg-[#fcd0d0] border-2 border-[#cb5521] text-[#cb5521] rounded-[8px] p-4 flex items-center gap-3 text-[14px]">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Course Info Card */}
      <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 sm:p-8 shadow-sm space-y-6">
        {/* Title */}
        <div>
          <label className="block text-[14px] font-bold text-[#1a3300] mb-1.5">
            Course Title <span className="text-[#cb5521]">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Modern Full-Stack Development with React & Strapi"
            className="w-full bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[6px] px-4 py-2.5 text-[15px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:border-[#1a3300] focus:ring-1 focus:ring-[#1a3300] transition-all"
            required
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[14px] font-bold text-[#1a3300] mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[6px] px-4 py-2.5 text-[14px] text-[#1a3300] focus:outline-none focus:border-[#1a3300] transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1a3300] mb-1.5">
              Publication Status
            </label>
            <select
              name="course_status"
              value={formData.course_status}
              onChange={handleChange}
              className="w-full bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[6px] px-4 py-2.5 text-[14px] text-[#1a3300] focus:outline-none focus:border-[#1a3300] transition-colors"
            >
              <option value="published">Published (Visible to students)</option>
              <option value="draft">Draft (Hidden from students)</option>
            </select>
          </div>
        </div>

        {/* Instructor Assignment */}
        <div>
          <label className="block text-[14px] font-bold text-[#1a3300] mb-1.5">
            Assigned Instructor
          </label>
          {userRole === "instructor" ? (
            <div className="bg-[#ffe95c]/30 border border-[#1a3300]/20 rounded-[6px] p-3 text-[13px] flex items-center justify-between">
              <span className="text-[#1a3300] font-medium">
                Instructor: <strong>{user?.username || user?.email}</strong> (You)
              </span>
              <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase bg-[#ffe95c] px-2 py-0.5 rounded-[4px]">
                Auto-assigned
              </span>
            </div>
          ) : (
            <select
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              className="w-full bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[6px] px-4 py-2.5 text-[14px] text-[#1a3300] focus:outline-none focus:border-[#1a3300] transition-colors"
            >
              {instructorsList.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.username} ({inst.email})
                </option>
              ))}
              {instructorsList.length === 0 && (
                <option value={user?.id}>
                  {user?.username} ({user?.email})
                </option>
              )}
            </select>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-[14px] font-bold text-[#1a3300] mb-1.5">
            Course Description <span className="text-[#cb5521]">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Describe the learning objectives, prerequisites, and what students will build..."
            className="w-full bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[6px] p-4 text-[14px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:border-[#1a3300] focus:ring-1 focus:ring-[#1a3300] transition-all"
            required
          />
        </div>

        {/* Thumbnail URL */}
        <div>
          <label className="block text-[14px] font-bold text-[#1a3300] mb-1.5">
            Thumbnail Image URL (Optional)
          </label>
          <input
            type="url"
            name="thumbnail_url"
            value={formData.thumbnail_url}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[6px] px-4 py-2.5 text-[14px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:border-[#1a3300] transition-colors"
          />
          <p className="text-[12px] font-mono text-[#1a3300]/60 mt-1">
            Provide a direct image URL for the course card preview.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-[#1a3300] border border-[#1a3300]/40 rounded-[6px] px-4 py-2.5 hover:bg-[#1a3300]/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-6 py-2.5 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#ffe95c]" />
          <span>{isSubmitting ? "Saving Course..." : isEdit ? "Update Course" : "Publish Course"}</span>
        </button>
      </div>
    </form>
  );
}
