"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import LessonForm from "@/components/lessons/LessonForm";
import { Edit3, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const courseId = params?.id;
  const lessonId = params?.lessonId;

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const userRole = user?.user_role || "student";

  // 1. Fetch lesson & course details
  useEffect(() => {
    if (!lessonId) return;

    setLoading(true);
    fetch(`/api/lessons/${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const lData = data.data;
          setLesson(lData);
          if (lData.course) {
            setCourse(lData.course);
          }
        } else {
          setError(data.error?.message || data.error || "Lesson not found.");
        }
      })
      .catch((err) => {
        console.error("Error loading lesson:", err);
        setError("Failed to load lesson details.");
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  // 2. Ownership verification for Instructor
  const isInstructor = userRole === "instructor";
  const courseInstructorId = course?.instructor?.id || course?.instructor;
  const isOwner = !isInstructor || (courseInstructorId === user?.id);

  if (!authLoading && userRole === "student") {
    return (
      <DashboardShell userRole="student">
        <div className="p-8 text-center bg-[#fcd0d0]/40 border-2 border-[#cb5521] rounded-[16px] max-w-[500px] mx-auto mt-12">
          <ShieldAlert className="w-10 h-10 text-[#cb5521] mx-auto mb-3" />
          <h2 className="text-[20px] font-bold text-[#1a3300] mb-2">Access Denied</h2>
          <p className="text-[14px] text-[#1a3300]/80 mb-4">
            Students cannot edit lessons.
          </p>
          <Link href="/dashboard/courses" className="bg-[#1a3300] text-[#fcfaf5] px-4 py-2 rounded-[6px] text-[13px]">
            Return to Courses
          </Link>
        </div>
      </DashboardShell>
    );
  }

  if (!loading && !isOwner) {
    return (
      <DashboardShell userRole={userRole}>
        <div className="p-8 text-center bg-[#fcd0d0]/40 border-2 border-[#cb5521] rounded-[16px] max-w-[500px] mx-auto mt-12">
          <ShieldAlert className="w-10 h-10 text-[#cb5521] mx-auto mb-3" />
          <h2 className="text-[20px] font-bold text-[#1a3300] mb-2">Ownership Restricted</h2>
          <p className="text-[14px] text-[#1a3300]/80 mb-4">
            You can only edit lessons belonging to your own courses.
          </p>
          <Link href="/dashboard/my-courses" className="bg-[#1a3300] text-[#fcfaf5] px-4 py-2 rounded-[6px] text-[13px]">
            Back to My Courses
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/lessons/${lesson?.documentId || lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/dashboard/courses/${courseId}`);
      } else {
        setError(data.error?.message || data.error || "Failed to update lesson.");
      }
    } catch (err) {
      console.error("Update lesson error:", err);
      setError("An unexpected error occurred while updating the lesson.");
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
            <Edit3 className="w-3.5 h-3.5" />
            <span>Lesson Studio</span>
          </div>
          <h1
            className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            Edit Lesson: {lesson?.title || "..."}
          </h1>
          <p className="text-[14px] text-[#1a3300]/75">
            Modify title, order index, video URL, or lesson content.
          </p>
        </div>

        {error && (
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-4 text-[#cb5521] text-[14px]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading lesson details...</p>
          </div>
        ) : lesson ? (
          <LessonForm
            initialData={lesson}
            courseTitle={course?.title || "Course"}
            courseId={courseId}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEdit={true}
          />
        ) : null}
      </div>
    </DashboardShell>
  );
}
