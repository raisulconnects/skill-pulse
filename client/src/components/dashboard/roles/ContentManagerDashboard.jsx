"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, PlusCircle, Sparkles, BookOpen } from "lucide-react";
import StatCard from "../shared/StatCard";
import SectionHeader from "../shared/SectionHeader";
import EmptyState from "../shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

const normalizeList = (data) =>
  Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

const courseKey = (c) => String(c?.documentId || c?.id);

const STATUS_FILTERS = ["all", "published", "draft"];

export default function ContentManagerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [lessonCounts, setLessonCounts] = useState({});
  const [quizCount, setQuizCount] = useState(0);
  const [filterTab, setFilterTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [coursesRes, lessonsRes, quizzesRes] = await Promise.all([
          fetch("/api/courses"),
          fetch(
            "/api/lessons?pagination[pageSize]=1000&populate[course][fields][0]=id&populate[course][fields][1]=documentId"
          ),
          fetch("/api/quizzes?pagination[pageSize]=1"),
        ]);

        const allCourses = normalizeList(await coursesRes.json());
        const lessons = normalizeList(await lessonsRes.json());
        const quizData = await quizzesRes.json();

        setCourses(allCourses);

        const counts = {};
        lessons.forEach((lesson) => {
          const key = courseKey(lesson.course);
          if (key) counts[key] = (counts[key] || 0) + 1;
        });
        setLessonCounts(counts);

        const quizTotal =
          typeof quizData?.meta?.pagination?.total === "number"
            ? quizData.meta.pagination.total
            : normalizeList(quizData).length;
        setQuizCount(quizTotal);
      } catch (err) {
        console.error("Error loading content manager dashboard:", err);
        setError("Failed to load the content manager dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authLoading, user]);

  const username = user?.username || user?.email?.split("@")[0] || "Content Manager";

  const publishedCount = courses.filter((c) => c.course_status === "published").length;
  const totalLessons = courses.reduce((sum, c) => sum + (lessonCounts[courseKey(c)] || 0), 0);

  const realStats = [
    {
      label: "Total Platform Courses",
      value: String(courses.length),
      trend: `${publishedCount} Published`,
      variant: "teal",
    },
    {
      label: "Published Courses",
      value: String(publishedCount),
      trend: "Live content",
      variant: "mint",
    },
    {
      label: "Total Lessons",
      value: String(totalLessons),
      trend: "Platform content",
      variant: "yellow",
    },
    {
      label: "Active Quizzes",
      value: String(quizCount),
      trend: "Assessments",
      variant: "blush",
    },
  ];

  const filteredCatalog = courses.filter((course) => {
    if (filterTab === "published") return course.course_status === "published";
    if (filterTab === "draft") return course.course_status === "draft";
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Content Manager Header Banner */}
      <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.05)_0px_4px_12px] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#a8e5e5] border border-[#1a3300]/20 px-3 py-1 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Content Management Hub</span>
            </div>
            <h1
              className="text-[28px] sm:text-[36px] font-[800] text-[#1a3300] leading-tight tracking-[0.02em] mb-2"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Platform Content Overview, <span className="bg-[#a8e5e5] px-2 py-0.5 rounded-[4px]">{username}</span>
            </h1>
            <p className="text-[15px] text-[#1a3300]/80 max-w-[600px]">
              Manage courses, lessons, and platform blog articles with authoring controls.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/dashboard/blog"
              className="inline-flex items-center justify-center gap-2 bg-[#a8e5e5] border border-[#1a3300] text-[#1a3300] px-5 py-3 rounded-[6px] text-[14px] font-bold hover:bg-[#a8e5e5]/80 transition-transform active:scale-[0.98] shadow-sm"
            >
              <FileText className="w-4 h-4 text-[#1a3300]" />
              <span>Blog CMS</span>
            </Link>
            <Link
              href="/dashboard/courses/create"
              className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-3 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#ffe95c]" />
              <span>Add Course</span>
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

      {/* Main Content Catalog Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SectionHeader
            title="Course Catalog & Moderation"
            subtitle="Platform-wide learning resources and publication status"
            badge="Catalog Audit"
            badgeBg="bg-[#a8e5e5]"
          />

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#fcfaf5] border border-[#1a3300]/20 p-1 rounded-[8px] self-start sm:self-auto font-mono text-[12px]">
            {STATUS_FILTERS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-[5px] font-medium capitalize transition-colors ${
                  filterTab === tab
                    ? "bg-[#1a3300] text-[#fcfaf5]"
                    : "text-[#1a3300]/70 hover:text-[#1a3300] hover:bg-[#1a3300]/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Table */}
        {loading ? (
          <div className="py-16 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading course catalog...</p>
          </div>
        ) : filteredCatalog.length === 0 ? (
          <EmptyState
            title="No Courses Found"
            description="There are no courses matching your selected filter."
          />
        ) : (
          <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a3300]/5 border-b border-[#b6b6b6]/40 text-[11px] font-mono text-[#1a3300]/70 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Course Title</th>
                    <th className="py-3.5 px-4 font-bold">Category</th>
                    <th className="py-3.5 px-4 font-bold">Author</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold">Lessons</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#b6b6b6]/30 text-[14px]">
                  {filteredCatalog.map((course) => {
                    const isPublished = course.course_status === "published";
                    const id = courseKey(course);
                    return (
                      <tr key={id} className="hover:bg-[#1a3300]/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#1a3300]">{course.title}</td>
                        <td className="py-3.5 px-4 font-mono text-[12px] text-[#1a3300]/75">
                          {course.category || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-[#1a3300]/80">
                          {course.instructor?.username || "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-[4px] border border-[#1a3300]/15 text-[#1a3300] ${
                              isPublished ? "bg-[#d5f5c2]" : "bg-[#f1f1f1]"
                            }`}
                          >
                            {isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[13px] text-[#1a3300]/80">
                          {lessonCounts[id] || 0} lessons
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/dashboard/courses/${id}`}
                            className="text-[12px] font-medium text-[#1a3300] border border-[#1a3300] rounded-[6px] px-3 py-1 hover:bg-[#1a3300]/10 transition-colors"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Content Activity */}
      <div className="space-y-4">
        <SectionHeader
          title="Recent Content Activity"
          subtitle="Most recently updated courses across the platform"
        />

        <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-4 divide-y divide-[#b6b6b6]/30">
          {courses.length === 0 ? (
            <p className="py-4 text-center text-[14px] text-[#1a3300]/70">
              No courses on the platform yet.
            </p>
          ) : (
            [...courses]
              .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
              .slice(0, 5)
              .map((course, idx) => (
                <div
                  key={idx}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase bg-[#a8e5e5] px-2 py-0.5 rounded-[4px] border border-[#1a3300]/15 text-[#1a3300]">
                        <BookOpen className="inline w-3 h-3 mr-1" />
                        Course
                      </span>
                      <span className="font-bold text-[14px] text-[#1a3300]">{course.title}</span>
                    </div>
                    <p className="text-[12px] text-[#1a3300]/70">
                      By {course.instructor?.username || "Unknown"} •{" "}
                      {course.updatedAt
                        ? new Date(course.updatedAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-mono ${
                      course.course_status === "published"
                        ? "bg-[#d5f5c2] text-[#1a3300]"
                        : "bg-[#f1f1f1] text-[#1a3300]/70"
                    } px-2.5 py-1 rounded-[4px]`}
                  >
                    {course.course_status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
