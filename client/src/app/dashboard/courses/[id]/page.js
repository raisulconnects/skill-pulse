"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import DeleteLessonModal from "@/components/lessons/DeleteLessonModal";
import {
  BookOpen,
  User,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Edit3,
  PlusCircle,
  Video,
  Trash2,
  Play,
  Lock,
  GraduationCap,
  Award,
  Sparkles,
} from "lucide-react";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const courseId = params?.id;

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  // Student progress state
  const [progressData, setProgressData] = useState({
    completed_lessons: [],
    percentage: 0,
    completed_count: 0,
    total_lessons: 0,
  });

  // Lesson deletion state
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);

  const userRole = user?.user_role || "student";

  const loadCourseData = async () => {
    if (!courseId) return;
    setLoading(true);
    setError("");

    try {
      // 1. Fetch course details
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();

      if (!res.ok || !data.data) {
        setError(data.error?.message || data.error || "Course not found.");
        setLoading(false);
        return;
      }

      const courseData = data.data;
      setCourse(courseData);

      // 2. Check if student is already enrolled & load progress
      if (user && userRole === "student") {
        const resEnroll = await fetch("/api/enrollments");
        const dataEnroll = await resEnroll.json();
        const enrollList = Array.isArray(dataEnroll.data) ? dataEnroll.data : (Array.isArray(dataEnroll) ? dataEnroll : []);
        const enrolled = enrollList.some((en) => {
          const cId = en.course?.documentId || en.course?.id || en.course;
          return String(cId) === String(courseData.documentId) || String(cId) === String(courseData.id) || String(cId) === String(courseId);
        });
        setIsEnrolled(enrolled);

        if (enrolled) {
          try {
            const pRes = await fetch(`/api/progress/course/${courseId}`);
            const pData = await pRes.json();
            if (pRes.ok && pData.data) {
              setProgressData(pData.data);
            }
          } catch (pErr) {
            console.error("Error fetching course progress:", pErr);
          }
        }
      }
    } catch (err) {
      console.error("Error loading course:", err);
      setError("Failed to load course details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadCourseData();
    }
  }, [courseId, authLoading, user]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: course.documentId || course.id }),
      });
      const data = await res.json();

      if (res.ok) {
        setIsEnrolled(true);
        loadCourseData();
      } else {
        alert(data.error?.message || data.error || "Failed to enroll.");
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      alert("An unexpected error occurred during enrollment.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleDeleteLessonConfirm = async () => {
    if (!lessonToDelete) return;
    setIsDeletingLesson(true);

    const lId = lessonToDelete.documentId || lessonToDelete.id;

    try {
      const res = await fetch(`/api/lessons/${lId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadCourseData();
        setLessonToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error?.message || data.error || "Failed to delete lesson.");
      }
    } catch (err) {
      console.error("Delete lesson error:", err);
      alert("An error occurred while deleting the lesson.");
    } finally {
      setIsDeletingLesson(false);
    }
  };

  // Extract description text if blocks
  let descriptionText = "";
  if (typeof course?.description === "string") {
    descriptionText = course.description;
  } else if (Array.isArray(course?.description)) {
    descriptionText = course.description
      .map((block) => block?.children?.map((c) => c.text).join("") || "")
      .join("\n\n");
  }

  const instructorName = course?.instructor?.username || "SkillPulse Instructor";
  const instructorEmail = course?.instructor?.email || "faculty@skillpulse.dev";

  // Sort lessons by lesson_order ascending
  const lessons = Array.isArray(course?.lessons)
    ? [...course.lessons].sort((a, b) => (a.lesson_order || 0) - (b.lesson_order || 0))
    : [];

  // Find next uncompleted lesson for "Continue Learning"
  const completedLessonIds = Array.isArray(progressData.completed_lessons) ? progressData.completed_lessons.map(String) : [];
  const nextUncompletedLesson = lessons.find((l) => {
    const lId = String(l.documentId || l.id);
    return !completedLessonIds.includes(lId);
  }) || lessons[0];

  const enrollmentsCount = Array.isArray(course?.enrollments) ? course.enrollments.length : 0;

  const isInstructorOrAdmin =
    userRole === "admin" ||
    userRole === "content_manager" ||
    (userRole === "instructor" && (course?.instructor?.id === user?.id || course?.instructor === user?.id));

  return (
    <DashboardShell userRole={userRole}>
      <div className="space-y-6 max-w-[1000px] animate-in fade-in duration-200">
        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Courses</span>
          </Link>

          {isInstructorOrAdmin && (
            <Link
              href={`/dashboard/courses/${course?.documentId || courseId}/edit`}
              className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 text-[#1a3300] px-4 py-1.5 rounded-[6px] text-[13px] font-medium hover:bg-[#ffe95c]/80 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Course</span>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading course details...</p>
          </div>
        ) : error || !course ? (
          <div className="bg-[#fcd0d0] border-2 border-[#cb5521] rounded-[12px] p-6 text-center text-[#cb5521]">
            <h3 className="font-bold text-[18px] mb-1">Course Unavailable</h3>
            <p className="text-[14px] mb-4">{error || "The requested course could not be loaded."}</p>
            <Link
              href="/dashboard/courses"
              className="inline-block bg-[#1a3300] text-[#fcfaf5] px-4 py-2 rounded-[6px] text-[13px]"
            >
              Return to Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Course Hero Banner */}
            <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.05)_0px_4px_12px] relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-[4px] bg-[#d5f5c2] border border-[#1a3300]/20 text-[#1a3300] uppercase tracking-wider">
                      {course.category || "Web Development"}
                    </span>
                    <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-[4px] bg-[#ffe95c] border border-[#1a3300]/20 text-[#1a3300] uppercase tracking-wider">
                      {course.course_status || "Published"}
                    </span>
                  </div>

                  <h1
                    className="text-[28px] sm:text-[36px] font-[800] text-[#1a3300] leading-tight"
                    style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                  >
                    {course.title}
                  </h1>

                  <div className="flex items-center gap-4 text-[13px] font-mono text-[#1a3300]/75 flex-wrap pt-1">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#1a3300]" />
                      Instructor: <strong className="text-[#1a3300]">{instructorName}</strong>
                    </span>
                    {enrollmentsCount > 0 && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-[#1a3300]" />
                        {enrollmentsCount} Enrolled
                      </span>
                    )}
                  </div>
                </div>

                {/* Enrollment / Progress Card Widget */}
                <div className="w-full md:w-72 bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[12px] p-5 shrink-0 shadow-sm flex flex-col justify-between">
                  <div className="mb-4">
                    <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase block mb-1">
                      Enrollment & Status
                    </span>
                    <span
                      className="text-[20px] font-bold text-[#1a3300] block leading-none"
                      style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                    >
                      {isEnrolled ? "Enrolled ✓" : "Open for Learning"}
                    </span>
                  </div>

                  {userRole === "student" ? (
                    isEnrolled ? (
                      <div className="space-y-3">
                        {/* Student Progress Summary */}
                        <div className="bg-[#1a3300]/5 border border-[#1a3300]/15 rounded-[8px] p-3 space-y-1.5">
                          <div className="flex items-center justify-between text-[12px] font-mono text-[#1a3300]">
                            <span>Course Progress</span>
                            <span className="font-bold">{progressData.percentage || 0}%</span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full h-2.5 bg-[#1a3300]/10 rounded-full overflow-hidden border border-[#1a3300]/15">
                            <div
                              className="h-full bg-[#1a3300] rounded-full transition-all duration-500"
                              style={{ width: `${progressData.percentage || 0}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-[#1a3300]/60 block text-right">
                            {progressData.completed_count || 0} of {lessons.length} lessons completed
                          </span>
                        </div>

                        {nextUncompletedLesson && (
                          <Link
                            href={`/dashboard/courses/${course?.documentId || courseId}/lessons/${nextUncompletedLesson.documentId || nextUncompletedLesson.id}`}
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] py-2.5 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
                          >
                            <Play className="w-3.5 h-3.5 fill-[#ffe95c] text-[#ffe95c]" />
                            <span>Continue Learning</span>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] py-3 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm disabled:opacity-50"
                      >
                        <span>{enrolling ? "Enrolling..." : "Enroll in Course"}</span>
                        <ArrowRight className="w-4 h-4 text-[#ffe95c]" />
                      </button>
                    )
                  ) : (
                    <div className="text-[12px] font-mono text-[#1a3300]/70 bg-[#1a3300]/5 p-2.5 rounded-[6px] text-center border border-[#1a3300]/10">
                      Role: {userRole} (Management Mode)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Course Overview & Description */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Cols: Description & Curriculum Syllabus */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 shadow-sm">
                  <h3
                    className="text-[20px] font-bold text-[#1a3300] mb-4 pb-2 border-b border-[#b6b6b6]/30"
                    style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                  >
                    About this Course
                  </h3>

                  <div className="text-[15px] text-[#1a3300]/85 leading-relaxed whitespace-pre-line">
                    {descriptionText || "No description provided for this course yet."}
                  </div>
                </div>

                {/* Course Modules / Lessons Management Section */}
                <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#b6b6b6]/30">
                    <div>
                      <h3
                        className="text-[20px] font-bold text-[#1a3300]"
                        style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                      >
                        Course Lessons & Syllabus
                      </h3>
                      <p className="text-[12px] font-mono text-[#1a3300]/60">
                        {lessons.length} {lessons.length === 1 ? "Lesson" : "Lessons"} in sequence
                      </p>
                    </div>

                    {isInstructorOrAdmin && (
                      <Link
                        href={`/dashboard/courses/${course?.documentId || courseId}/lessons/new`}
                        className="inline-flex items-center gap-1.5 bg-[#1a3300] text-[#fcfaf5] px-3.5 py-1.5 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm self-start sm:self-auto"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#ffe95c]" />
                        <span>Add Lesson</span>
                      </Link>
                    )}
                  </div>

                  {lessons.length === 0 ? (
                    <div className="p-6 text-center bg-[#1a3300]/5 rounded-[8px] border border-dashed border-[#1a3300]/20">
                      <BookOpen className="w-8 h-8 text-[#1a3300]/40 mx-auto mb-2" />
                      <p className="text-[14px] text-[#1a3300]/70 font-medium">No lessons added yet</p>
                      <p className="text-[12px] font-mono text-[#1a3300]/50 mt-1">
                        {isInstructorOrAdmin
                          ? "Click 'Add Lesson' above to create the first module for this course."
                          : "Lesson modules will appear here once published by the instructor."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {lessons.map((lesson, idx) => {
                        const lId = String(lesson.documentId || lesson.id);
                        const hasVideo = !!lesson.video_url;
                        const isLessonCompleted = completedLessonIds.includes(lId);
                        const isNextUp = !isLessonCompleted && String(nextUncompletedLesson?.documentId || nextUncompletedLesson?.id) === lId;

                        return (
                          <div
                            key={lId || idx}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-[8px] border transition-colors gap-3 ${
                              isLessonCompleted
                                ? "bg-[#d5f5c2]/20 border-[#1a3300]/20"
                                : isNextUp
                                ? "bg-[#ffe95c]/20 border-[#1a3300]/40 shadow-xs"
                                : "bg-[#fcfaf5] border border-[#1a3300]/20 hover:border-[#1a3300]"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-7 h-7 rounded-[6px] font-mono text-[12px] font-bold flex items-center justify-center shrink-0 ${
                                  isLessonCompleted
                                    ? "bg-[#d5f5c2] border border-[#1a3300]/20 text-[#1a3300]"
                                    : "bg-[#1a3300]/10 text-[#1a3300]"
                                }`}
                              >
                                {isLessonCompleted ? "✓" : (lesson.lesson_order || idx + 1)}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-[14px] text-[#1a3300] truncate">
                                    {lesson.title}
                                  </h4>
                                  {isLessonCompleted && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.2 rounded-[4px] bg-[#d5f5c2] border border-[#1a3300]/20 text-[#1a3300]">
                                      Completed ✓
                                    </span>
                                  )}
                                  {isNextUp && isEnrolled && userRole === "student" && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.2 rounded-[4px] bg-[#ffe95c] border border-[#1a3300]/20 text-[#1a3300]">
                                      Next Up →
                                    </span>
                                  )}
                                  {hasVideo && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.2 rounded-[4px] bg-[#1a3300]/10 text-[#1a3300]">
                                      <Video className="w-3 h-3" />
                                      <span>Video</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              {/* Open Lesson Button (For Enrolled Students or Management) */}
                              {(userRole !== "student" || isEnrolled) ? (
                                <Link
                                  href={`/dashboard/courses/${course?.documentId || courseId}/lessons/${lId}`}
                                  className={`inline-flex items-center gap-1 text-[12px] font-mono font-medium px-3 py-1 rounded-[5px] transition-colors ${
                                    isNextUp
                                      ? "bg-[#1a3300] text-[#fcfaf5] hover:bg-[#1a3300]/90"
                                      : "bg-[#d5f5c2] border border-[#1a3300]/20 text-[#1a3300] hover:bg-[#d5f5c2]/80"
                                  }`}
                                >
                                  <Play className={`w-3 h-3 ${isNextUp ? "fill-[#ffe95c] text-[#ffe95c]" : "fill-[#1a3300]"}`} />
                                  <span>{isLessonCompleted ? "Review" : "Open"}</span>
                                </Link>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#1a3300]/50 bg-[#1a3300]/5 px-2.5 py-1 rounded-[5px]">
                                  <Lock className="w-3 h-3" />
                                  <span>Locked</span>
                                </span>
                              )}

                              {/* Instructor / Admin Actions */}
                              {isInstructorOrAdmin && (
                                <>
                                  <Link
                                    href={`/dashboard/courses/${course?.documentId || courseId}/lessons/${lId}/edit`}
                                    className="p-1.5 text-[#1a3300]/70 hover:text-[#1a3300] hover:bg-[#1a3300]/10 rounded-[4px] transition-colors"
                                    title="Edit Lesson"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => setLessonToDelete(lesson)}
                                    className="p-1.5 text-[#cb5521]/80 hover:text-[#cb5521] hover:bg-[#cb5521]/10 rounded-[4px] transition-colors"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right 1 Col: Instructor Bio */}
              <div className="space-y-4">
                <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-5 shadow-sm">
                  <h4
                    className="text-[16px] font-bold text-[#1a3300] mb-3 pb-2 border-b border-[#b6b6b6]/30"
                    style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                  >
                    Course Instructor
                  </h4>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#ffe95c] border border-[#1a3300]/20 flex items-center justify-center font-mono font-bold text-[15px] text-[#1a3300]">
                      {instructorName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-[15px] text-[#1a3300] block">
                        {instructorName}
                      </span>
                      <span className="text-[12px] font-mono text-[#1a3300]/60 block">
                        {instructorEmail}
                      </span>
                    </div>
                  </div>

                  <p className="text-[13px] text-[#1a3300]/75 leading-relaxed">
                    Lead educator at SkillPulse specializing in hands-on, modern engineering curricula.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteLessonModal
        isOpen={!!lessonToDelete}
        lessonTitle={lessonToDelete?.title || ""}
        onConfirm={handleDeleteLessonConfirm}
        onClose={() => setLessonToDelete(null)}
        isDeleting={isDeletingLesson}
      />
    </DashboardShell>
  );
}
