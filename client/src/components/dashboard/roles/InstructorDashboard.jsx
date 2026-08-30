"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Users, ArrowRight, Sparkles } from "lucide-react";
import StatCard from "../shared/StatCard";
import SectionHeader from "../shared/SectionHeader";
import EmptyState from "../shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

const normalizeList = (data) =>
  Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

const courseKey = (c) => String(c?.documentId || c?.id);

export default function InstructorDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [lessonCounts, setLessonCounts] = useState({});
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [coursesRes, lessonsRes, enrollmentsRes] = await Promise.all([
          fetch("/api/courses?mine=true"),
          fetch(
            "/api/lessons?pagination[pageSize]=1000&populate[course][fields][0]=id&populate[course][fields][1]=documentId"
          ),
          fetch("/api/enrollments"),
        ]);

        const myCourses = normalizeList(await coursesRes.json());
        const lessons = normalizeList(await lessonsRes.json());
        const enrollments = normalizeList(await enrollmentsRes.json());

        setCourses(myCourses);

        const myCourseKeys = new Set(myCourses.map((c) => courseKey(c)));
        const counts = {};
        lessons.forEach((lesson) => {
          const key = courseKey(lesson.course);
          if (key && myCourseKeys.has(key)) {
            counts[key] = (counts[key] || 0) + 1;
          }
        });
        setLessonCounts(counts);

        const relevant = enrollments
          .filter((en) => en?.course && myCourseKeys.has(courseKey(en.course)))
          .sort(
            (a, b) =>
              new Date(b.enrollment_date || 0).getTime() -
              new Date(a.enrollment_date || 0).getTime()
          );
        setRecentEnrollments(relevant.slice(0, 5));
      } catch (err) {
        console.error("Error loading instructor dashboard:", err);
        setError("Failed to load your instructor dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authLoading, user]);

  const username = user?.username || user?.email?.split("@")[0] || "Instructor";

  const publishedCourses = courses.filter((c) => c.course_status === "published");
  const totalStudents = courses.reduce(
    (sum, c) => sum + (Array.isArray(c.enrollments) ? c.enrollments.length : 0),
    0
  );
  const totalLessons = courses.reduce(
    (sum, c) => sum + (lessonCounts[courseKey(c)] || 0),
    0
  );

  const realStats = [
    {
      label: "My Live Courses",
      value: String(publishedCourses.length),
      trend: courses.length > 0 ? `${courses.length - publishedCourses.length} in draft` : "None",
      variant: "yellow",
    },
    {
      label: "Total Students",
      value: totalStudents.toLocaleString(),
      trend: "Across all courses",
      variant: "mint",
    },
    {
      label: "Total Lessons",
      value: String(totalLessons),
      trend: "Published content",
      variant: "teal",
    },
    {
      label: "Total Courses",
      value: String(courses.length),
      trend: "All statuses",
      variant: "blush",
    },
  ];

  const activeStudents = totalStudents;
  const publishedModuleCount = publishedCourses.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Instructor Welcome Header */}
      <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.05)_0px_4px_12px] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 px-3 py-1 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instructor Studio</span>
            </div>
            <h1
              className="text-[28px] sm:text-[36px] font-[800] text-[#1a3300] leading-tight tracking-[0.02em] mb-2"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Welcome back, <span className="bg-[#d5f5c2] px-2 py-0.5 rounded-[4px]">Prof. {username}</span>!
            </h1>
            {activeStudents > 0 ? (
              <p className="text-[15px] text-[#1a3300]/80 max-w-[600px]">
                Your courses have reached{" "}
                <strong className="font-bold text-[#1a3300]">
                  {activeStudents.toLocaleString()} active students
                </strong>{" "}
                across {publishedModuleCount} published {publishedModuleCount === 1 ? "module" : "modules"}.
              </p>
            ) : (
              <p className="text-[15px] text-[#1a3300]/80 max-w-[600px]">
                No students enrolled yet. Create a course and share it with the platform.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/dashboard/courses/create"
              className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-3 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#ffe95c]" />
              <span>Create New Course</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-4 text-[#cb5521] text-[14px]">
          {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {realStats.map((s, idx) => (
          <StatCard key={idx} label={s.label} value={s.value} trend={s.trend} variant={s.variant} />
        ))}
      </div>

      {/* My Courses Section */}
      <div className="space-y-4">
        <SectionHeader
          title="My Teaching Courses"
          subtitle="Manage your course content, student rosters, and publish statuses"
          badge="Instructor Content"
          badgeBg="bg-[#ffe95c]"
          actionText="Manage All"
          actionHref="/dashboard/my-courses"
        />

        {loading ? (
          <div className="py-16 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading your courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            title="No Courses Created Yet"
            description="You haven't created any courses yet. Start sharing your knowledge by publishing your first course."
            actionText="Create Course"
            onActionClick={() => (window.location.href = "/dashboard/courses/create")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => {
              const id = courseKey(course);
              const students = Array.isArray(course.enrollments) ? course.enrollments.length : 0;
              const lessons = lessonCounts[id] || 0;
              const isPublished = course.course_status === "published";
              return (
                <div
                  key={id}
                  className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-5 flex flex-col justify-between hover:border-[#1a3300] transition-colors shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] border border-[#1a3300]/20 ${
                          isPublished ? "bg-[#d5f5c2] text-[#1a3300]" : "bg-[#f1f1f1] text-[#1a3300]/70"
                        }`}
                      >
                        {isPublished ? "Published" : "Draft"}
                      </span>
                      <span className="text-[12px] font-mono text-[#1a3300]/60">
                        {course.category || "Development"}
                      </span>
                    </div>

                    <h4 className="font-bold text-[18px] text-[#1a3300] mb-3 leading-snug">
                      {course.title}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 py-3 bg-[#fcfaf5] border border-[#1a3300]/15 rounded-[8px] px-3 mb-4 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-[#1a3300]/60 uppercase block flex items-center justify-center gap-1">
                          <Users className="w-3 h-3" /> Students
                        </span>
                        <span className="text-[14px] font-bold text-[#1a3300]">{students}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#1a3300]/60 uppercase block">Lessons</span>
                        <span className="text-[14px] font-bold text-[#1a3300]">{lessons}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link
                      href={`/dashboard/courses/${id}/edit`}
                      className="text-[13px] font-medium text-[#1a3300] border border-[#1a3300] rounded-[6px] px-3.5 py-1.5 hover:bg-[#1a3300]/5 transition-colors"
                    >
                      Edit Content
                    </Link>
                    <Link
                      href={`/dashboard/courses/${id}`}
                      className="text-[13px] font-medium text-[#1a3300]/80 hover:text-[#1a3300] flex items-center gap-1"
                    >
                      <span>View Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Student Activity */}
      <div className="space-y-4">
        <SectionHeader
          title="Recent Student Activity"
          subtitle="Latest students enrolling in your courses"
        />

        <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-4 divide-y divide-[#b6b6b6]/30">
          {recentEnrollments.length === 0 ? (
            <p className="py-4 text-center text-[14px] text-[#1a3300]/70">
              No student enrollments yet. Share your courses to get started.
            </p>
          ) : (
            recentEnrollments.map((item, idx) => (
              <div
                key={idx}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[14px] text-[#1a3300]">
                      {item.student?.username || item.student?.email || "Student"}
                    </span>
                    <span className="text-[11px] font-mono text-[#1a3300]/60">
                      • {item.course?.title || "Course"}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#1a3300]/80">Enrolled in your course</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                  <span className="text-[11px] font-mono text-[#1a3300]/60">
                    {item.enrollment_date
                      ? new Date(item.enrollment_date).toLocaleDateString()
                      : ""}
                  </span>
                  <span className="text-[12px] font-mono font-bold text-[#1a3300] bg-[#d5f5c2] px-2.5 py-1 rounded-[4px] border border-[#1a3300]/20">
                    Enrolled
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
