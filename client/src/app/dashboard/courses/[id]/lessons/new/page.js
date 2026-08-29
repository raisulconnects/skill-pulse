"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import LessonForm from "@/components/lessons/LessonForm";
import { PlusCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function CreateLessonPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const courseId = params?.id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const userRole = user?.user_role || "student";

  // 1. Fetch parent course details
  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    fetch(`/api/courses/${courseId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setCourse(data.data);
        } else {
          setError(data.error?.message || data.error || "Course not found.");
        }
      })
      .catch((err) => {
        console.error("Error loading course:", err);
        setError("Failed to load parent course details.");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

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
            Students cannot create lessons.
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
            You can only add lessons to courses that you own.
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
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      const data = await res.json();

      if (res.ok) {
        // Return to course details management
        router.push(`/dashboard/courses/${courseId}`);
      } else {
        setError(data.error?.message || data.error || "Failed to create lesson.");
      }
    } catch (err) {
      console.error("Create lesson error:", err);
      setError("An unexpected error occurred while saving the lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextOrder = (course?.lessons?.length || 0) + 1;

  return (
    <DashboardShell userRole={userRole}>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="pb-4 border-b border-[#b6b6b6]/30">
          <div className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] mb-2 uppercase tracking-wider">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Lesson Studio</span>
          </div>
          <h1
            className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            Add New Lesson
          </h1>
          <p className="text-[14px] text-[#1a3300]/75">
            Create a structured lesson module for your course curriculum.
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
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading course curriculum context...</p>
          </div>
        ) : (
          <LessonForm
            initialData={{ lesson_order: nextOrder }}
            courseTitle={course?.title || "Course"}
            courseId={courseId}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEdit={false}
          />
        )}
      </div>
    </DashboardShell>
  );
}
