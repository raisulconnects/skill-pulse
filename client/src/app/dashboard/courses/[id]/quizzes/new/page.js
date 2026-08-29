"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import QuizForm from "@/components/quizzes/QuizForm";

export default function NewQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const courseId = params?.id;
  const userRole = user?.user_role || "student";

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole === "student") {
      router.replace("/dashboard");
      return;
    }

    async function loadCourse() {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        const data = await res.json();
        if (res.ok && data.data) {
          setCourse(data.data);
        } else {
          setError("Course not found.");
        }
      } catch {
        setError("Failed to load course.");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [authLoading, user, courseId]);

  const handleSubmit = async ({ title }) => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            title,
            course: courseId,
          },
        }),
      });

      const data = await res.json();

      if (res.ok && data.data) {
        const quizId = data.data.documentId || data.data.id;
        // Redirect to quiz edit/questions page
        router.push(`/dashboard/courses/${courseId}/quizzes/${quizId}/edit`);
      } else {
        setError(data.error?.message || data.error || "Failed to create quiz.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Create quiz error:", err);
      setError("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell userRole={userRole}>
      <div className="animate-in fade-in duration-200">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading...</p>
          </div>
        ) : error && !course ? (
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-4 text-[#cb5521] text-[14px]">
            {error}
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-3 mb-4 text-[#cb5521] text-[13px]">
                {error}
              </div>
            )}
            <QuizForm
              courseId={courseId}
              courseTitle={course?.title || "Course"}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isEdit={false}
            />
          </>
        )}
      </div>
    </DashboardShell>
  );
}
