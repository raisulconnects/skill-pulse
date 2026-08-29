"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import CourseForm from "@/components/courses/CourseForm";
import { PlusCircle, Sparkles, ShieldAlert } from "lucide-react";

export default function CreateCoursePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const userRole = user?.user_role || "student";

  // Prevent students from viewing the create form
  if (!authLoading && userRole === "student") {
    return (
      <DashboardShell userRole="student">
        <div className="p-8 text-center bg-[#fcd0d0]/40 border-2 border-[#cb5521] rounded-[16px] max-w-[500px] mx-auto mt-12">
          <ShieldAlert className="w-10 h-10 text-[#cb5521] mx-auto mb-3" />
          <h2
            className="text-[20px] font-bold text-[#1a3300] mb-2"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            Access Denied
          </h2>
          <p className="text-[14px] text-[#1a3300]/80 mb-4">
            Students are not permitted to create or publish courses.
          </p>
          <button
            onClick={() => router.push("/dashboard/courses")}
            className="bg-[#1a3300] text-[#fcfaf5] px-5 py-2 rounded-[6px] text-[13px] font-medium"
          >
            Browse Courses
          </button>
        </div>
      </DashboardShell>
    );
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect based on role
        if (userRole === "instructor") {
          router.push("/dashboard/my-courses");
        } else if (userRole === "content_manager") {
          router.push("/dashboard/manage-courses");
        } else {
          router.push("/dashboard/courses");
        }
      } else {
        setError(data.error?.message || data.error || "Failed to create course.");
      }
    } catch (err) {
      console.error("Create course error:", err);
      setError("An unexpected error occurred while saving the course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell userRole={userRole}>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="pb-4 border-b border-[#b6b6b6]/30">
          <div className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] mb-2 uppercase tracking-wider">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Course Studio</span>
          </div>
          <h1
            className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            Create New Course
          </h1>
          <p className="text-[14px] text-[#1a3300]/75">
            Fill in the course details below to publish or save as a draft.
          </p>
        </div>

        {error && (
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-4 text-[#cb5521] text-[14px]">
            {error}
          </div>
        )}

        {/* Form */}
        <CourseForm
          user={user}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEdit={false}
        />
      </div>
    </DashboardShell>
  );
}
