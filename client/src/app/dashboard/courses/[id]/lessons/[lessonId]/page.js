"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Play,
  Video,
  Edit3,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Lock,
  Award,
} from "lucide-react";

/**
 * Helper to convert YouTube URL to embed format
 */
function getEmbedVideoUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();

  // YouTube watch format: youtube.com/watch?v=ID
  if (trimmed.includes("youtube.com/watch")) {
    try {
      const parsedUrl = new URL(trimmed);
      const videoId = parsedUrl.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      // ignore
    }
  }

  // YouTube short format: youtu.be/ID
  if (trimmed.includes("youtu.be/")) {
    const videoId = trimmed.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  // Vimeo format: vimeo.com/ID
  if (trimmed.includes("vimeo.com/")) {
    const videoId = trimmed.split("vimeo.com/")[1]?.split("?")[0];
    if (videoId) return `https://player.vimeo.com/video/${videoId}`;
  }

  return trimmed;
}

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const courseId = params?.id;
  const lessonId = params?.lessonId;

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Progress state
  const [progressData, setProgressData] = useState({
    completed_lessons: [],
    percentage: 0,
    total_lessons: 0,
  });
  const [isCompleting, setIsCompleting] = useState(false);

  const userRole = user?.user_role || "student";

  const loadData = async () => {
    if (!lessonId || !courseId) return;
    setLoading(true);
    setError("");

    try {
      // 1. Fetch lesson details
      const lessonRes = await fetch(`/api/lessons/${lessonId}`);
      const lessonData = await lessonRes.json();

      if (!lessonRes.ok || !lessonData.data) {
        setError(lessonData.error?.message || lessonData.error || "Lesson not found or access restricted.");
        setLoading(false);
        return;
      }

      const currentLesson = lessonData.data;
      setLesson(currentLesson);

      // 2. Fetch course details
      const courseRes = await fetch(`/api/courses/${courseId}`);
      const courseData = await courseRes.json();

      if (courseRes.ok && courseData.data) {
        setCourse(courseData.data);

        // Check enrollment if student
        if (user && userRole === "student") {
          const resEnroll = await fetch("/api/enrollments");
          const dataEnroll = await resEnroll.json();
          const enrollList = Array.isArray(dataEnroll.data) ? dataEnroll.data : (Array.isArray(dataEnroll) ? dataEnroll : []);
          const enrolled = enrollList.some((en) => {
            const cId = en.course?.documentId || en.course?.id || en.course;
            return String(cId) === String(courseData.data.documentId) || String(cId) === String(courseData.data.id) || String(cId) === String(courseId);
          });
          setIsEnrolled(enrolled);

          // 3. Fetch Student Course Progress
          if (enrolled) {
            try {
              const pRes = await fetch(`/api/progress/course/${courseId}`);
              const pData = await pRes.json();
              if (pRes.ok && pData.data) {
                setProgressData(pData.data);
              }
            } catch (pErr) {
              console.error("Error loading course progress:", pErr);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error loading lesson view:", err);
      setError("Failed to load lesson content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [lessonId, courseId, authLoading, user]);

  const handleMarkComplete = async () => {
    if (!user || userRole !== "student" || isCompleting) return;
    setIsCompleting(true);

    const targetLessonId = lesson?.documentId || lesson?.id || lessonId;

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: course?.documentId || courseId,
          lesson: targetLessonId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.data) {
        setProgressData((prev) => ({
          ...prev,
          completed_lessons: data.data.completed_lessons || [...prev.completed_lessons, targetLessonId],
          percentage: data.data.percentage ?? prev.percentage,
          completed_count: data.data.completed_count ?? prev.completed_count,
        }));
      } else {
        alert(data.error?.message || data.error || "Failed to mark lesson complete.");
      }
    } catch (err) {
      console.error("Complete lesson error:", err);
      alert("An unexpected error occurred while saving progress.");
    } finally {
      setIsCompleting(false);
    }
  };

  // Check if current lesson is completed
  const currentNumericId = lesson?.id;
  const currentDocId = lesson?.documentId;
  const isLessonCompleted = Array.isArray(progressData.completed_lessons) && progressData.completed_lessons.some(
    (item) => String(item) === String(currentNumericId) || String(item) === String(currentDocId) || String(item) === String(lessonId)
  );

  // Handle block or string description
  let descriptionText = "";
  if (typeof lesson?.description === "string") {
    descriptionText = lesson.description;
  } else if (Array.isArray(lesson?.description)) {
    descriptionText = lesson.description
      .map((block) => block?.children?.map((c) => c.text).join("") || "")
      .join("\n\n");
  }

  // Syllabus sorting & prev/next calculation
  const allLessons = Array.isArray(course?.lessons)
    ? [...course.lessons].sort((a, b) => (a.lesson_order || 0) - (b.lesson_order || 0))
    : [];

  const currentIdx = allLessons.findIndex(
    (l) => String(l.documentId || l.id) === String(lesson?.documentId || lessonId)
  );

  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const videoUrl = lesson?.video_url;
  const embedUrl = getEmbedVideoUrl(videoUrl);
  const isDirectMp4 = videoUrl && (videoUrl.endsWith(".mp4") || videoUrl.endsWith(".webm"));

  const isInstructorOrAdmin =
    userRole === "admin" ||
    userRole === "content_manager" ||
    (userRole === "instructor" && (course?.instructor?.id === user?.id || course?.instructor === user?.id));

  return (
    <DashboardShell userRole={userRole}>
      <div className="space-y-6 max-w-[1000px] animate-in fade-in duration-200">
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {course?.title || "Course"}</span>
          </Link>

          {isInstructorOrAdmin && (
            <Link
              href={`/dashboard/courses/${courseId}/lessons/${lesson?.documentId || lessonId}/edit`}
              className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 text-[#1a3300] px-4 py-1 rounded-[6px] text-[13px] font-medium hover:bg-[#ffe95c]/80 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Lesson</span>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading lesson workspace...</p>
          </div>
        ) : error || !lesson ? (
          <div className="bg-[#fcd0d0] border-2 border-[#cb5521] rounded-[12px] p-6 text-center text-[#cb5521]">
            <Lock className="w-10 h-10 mx-auto mb-2 text-[#cb5521]" />
            <h3 className="font-bold text-[18px] mb-1">Access Restricted</h3>
            <p className="text-[14px] mb-4">{error || "You do not have access to this lesson."}</p>
            <Link
              href={`/dashboard/courses/${courseId}`}
              className="inline-block bg-[#1a3300] text-[#fcfaf5] px-4 py-2 rounded-[6px] text-[13px]"
            >
              Go to Course Details
            </Link>
          </div>
        ) : userRole === "student" && !isEnrolled ? (
          <div className="bg-[#ffe95c]/40 border-2 border-[#1a3300] rounded-[16px] p-8 text-center max-w-[550px] mx-auto mt-8">
            <Lock className="w-12 h-12 mx-auto mb-3 text-[#1a3300]" />
            <h3
              className="text-[22px] font-bold text-[#1a3300] mb-2"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Enrollment Required
            </h3>
            <p className="text-[14px] text-[#1a3300]/80 mb-6 leading-relaxed">
              You must be enrolled in <strong className="text-[#1a3300]">{course?.title}</strong> to view this lesson module and access learning materials.
            </p>
            <Link
              href={`/dashboard/courses/${courseId}`}
              className="inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-6 py-2.5 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98]"
            >
              <span>View Course & Enroll</span>
              <ArrowRight className="w-4 h-4 text-[#ffe95c]" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 shadow-[rgba(0,0,0,0.05)_0px_4px_12px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-[4px] bg-[#d5f5c2] border border-[#1a3300]/20 text-[#1a3300] uppercase tracking-wider">
                    Lesson 0{lesson.lesson_order || currentIdx + 1}
                  </span>
                  {videoUrl && (
                    <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-[4px] bg-[#ffe95c] border border-[#1a3300]/20 text-[#1a3300] uppercase tracking-wider flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      <span>Video Included</span>
                    </span>
                  )}
                </div>

                <h1
                  className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight"
                  style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                >
                  {lesson.title}
                </h1>
                <p className="text-[13px] font-mono text-[#1a3300]/60 mt-1">
                  Course: {course?.title}
                </p>
              </div>

              {/* Student Progress Badge & Complete Action */}
              {userRole === "student" && isEnrolled && (
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-[#1a3300]/15 pt-3 sm:pt-0">
                  <div className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 px-2.5 py-1 rounded-[6px] font-mono text-[12px] text-[#1a3300] font-bold">
                    <Award className="w-3.5 h-3.5" />
                    <span>Progress: {progressData.percentage || 0}%</span>
                  </div>

                  {isLessonCompleted ? (
                    <div className="inline-flex items-center gap-1.5 bg-[#d5f5c2] border border-[#1a3300]/30 px-4 py-2 rounded-[6px] text-[13px] font-bold text-[#1a3300]">
                      <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                      <span>Lesson Completed ✓</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMarkComplete}
                      disabled={isCompleting}
                      className="inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-4 py-2 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm disabled:opacity-50"
                    >
                      {isCompleting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-[#fcfaf5] border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#ffe95c]" />
                          <span>Mark as Complete</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Video Player Area (ONLY displayed if video_url exists) */}
            {videoUrl && embedUrl && (
              <div className="bg-[#1a3300] border-2 border-[#1a3300] rounded-[16px] overflow-hidden shadow-md">
                <div className="aspect-video w-full bg-black relative">
                  {isDirectMp4 ? (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-contain"
                      poster={course?.thumbnail_url || undefined}
                    >
                      Your browser does not support HTML5 video playback.
                    </video>
                  ) : (
                    <iframe
                      src={embedUrl}
                      title={lesson.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            )}

            {/* Lesson Content / Description */}
            <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[16px] p-6 sm:p-8 shadow-sm space-y-4">
              <h3
                className="text-[18px] font-bold text-[#1a3300] pb-2 border-b border-[#b6b6b6]/30 flex items-center gap-2"
                style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
              >
                <BookOpen className="w-4 h-4 text-[#1a3300]" />
                <span>Lesson Material & Instructions</span>
              </h3>

              <div className="text-[15px] text-[#1a3300]/85 leading-relaxed whitespace-pre-line">
                {descriptionText || "No additional text content provided for this lesson."}
              </div>
            </div>

            {/* Previous / Next Lesson Navigation Footer */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#b6b6b6]/30">
              {prevLesson ? (
                <Link
                  href={`/dashboard/courses/${courseId}/lessons/${prevLesson.documentId || prevLesson.id}`}
                  className="inline-flex items-center gap-2 bg-[#fcfaf5] border border-[#1a3300]/30 text-[#1a3300] px-4 py-2.5 rounded-[8px] text-[13px] font-medium hover:border-[#1a3300] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <div className="text-left hidden sm:block">
                    <span className="text-[10px] font-mono text-[#1a3300]/60 block uppercase">Previous Lesson</span>
                    <span>{prevLesson.title}</span>
                  </div>
                  <span className="sm:hidden">Prev Lesson</span>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/dashboard/courses/${courseId}/lessons/${nextLesson.documentId || nextLesson.id}`}
                  className="inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-4 py-2.5 rounded-[8px] text-[13px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98]"
                >
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-mono text-[#ffe95c] block uppercase">Next Lesson</span>
                    <span>{nextLesson.title}</span>
                  </div>
                  <span className="sm:hidden">Next Lesson</span>
                  <ChevronRight className="w-4 h-4 text-[#ffe95c]" />
                </Link>
              ) : (
                <Link
                  href={`/dashboard/courses/${courseId}`}
                  className="inline-flex items-center gap-1.5 bg-[#d5f5c2] border border-[#1a3300]/20 text-[#1a3300] px-4 py-2.5 rounded-[8px] text-[13px] font-bold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Syllabus Completed</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
