"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Play, CheckCircle2, Trophy, Clock, ArrowRight, BookOpen, Compass, Award } from "lucide-react";
import StatCard from "../shared/StatCard";
import SectionHeader from "../shared/SectionHeader";
import { MOCK_STUDENT_DATA } from "@/lib/mock-dashboard-data";

export default function StudentDashboard({ user }) {
  const [enrollments, setEnrollments] = useState([]);
  const [progresses, setProgresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = user?.username || user?.email?.split("@")[0] || "Student";

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch real enrollments
        const eRes = await fetch("/api/enrollments");
        const eData = await eRes.json();
        const eList = Array.isArray(eData.data) ? eData.data : (Array.isArray(eData) ? eData : []);
        setEnrollments(eList);

        // Fetch real progress records
        const pRes = await fetch("/api/progress");
        const pData = await pRes.json();
        const pList = Array.isArray(pData.data) ? pData.data : (Array.isArray(pData) ? pData : []);
        setProgresses(pList);
      } catch (err) {
        console.error("Error loading student dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user]);

  // Derived real metrics
  const activeCoursesCount = enrollments.length;
  const completedLessonsTotal = progresses.reduce((acc, p) => acc + (p.completed_count || 0), 0);
  const avgProgress = activeCoursesCount > 0
    ? Math.round(progresses.reduce((acc, p) => acc + (p.percentage || 0), 0) / activeCoursesCount)
    : 0;
  const completedCoursesCount = progresses.filter((p) => (p.percentage || 0) === 100).length;

  const realStats = [
    { label: "Enrolled Courses", value: String(activeCoursesCount), trend: activeCoursesCount > 0 ? "Active" : "None", variant: "cream" },
    { label: "Lessons Completed", value: String(completedLessonsTotal), trend: "Modules Done", variant: "mint" },
    { label: "Average Progress", value: `${avgProgress}%`, trend: "Overall Completion", variant: "yellow" },
    { label: "Completed Courses", value: String(completedCoursesCount), trend: "Certificates Earned", variant: "teal font-mono" },
  ];

  // Active continue course (first enrollment or highest activity)
  const firstEnrollment = enrollments[0];
  const activeCourse = firstEnrollment?.course || null;
  const activeCourseId = activeCourse ? (activeCourse.documentId || activeCourse.id) : null;
  const activeProgress = activeCourseId
    ? progresses.find((p) => String(p.course?.documentId || p.course?.id || p.course) === String(activeCourseId))
    : null;

  const activePercentage = activeProgress?.percentage || 0;
  const activeCompletedCount = activeProgress?.completed_count || 0;
  const activeTotalLessons = activeProgress?.total_lessons || (activeCourse?.lessons?.length || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.05)_0px_4px_12px] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#d5f5c2] border border-[#1a3300]/20 px-3 py-1 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Workspace</span>
            </div>
            <h1
              className="text-[28px] sm:text-[36px] font-[800] text-[#1a3300] leading-tight tracking-[0.02em] mb-2"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Welcome back, <span className="bg-[#ffe95c] px-2 py-0.5 rounded-[4px]">{username}</span>!
            </h1>
            <p className="text-[15px] text-[#1a3300]/80 max-w-[600px]">
              {activeCoursesCount > 0 ? (
                <>You are currently enrolled in <strong className="font-bold text-[#1a3300]">{activeCoursesCount} {activeCoursesCount === 1 ? "course" : "courses"}</strong> with an average completion rate of <strong className="font-bold text-[#1a3300]">{avgProgress}%</strong>.</>
              ) : (
                <>Welcome to SkillPulse! Explore our course catalog to enroll and start building your skills.</>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {activeCourseId ? (
              <Link
                href={`/dashboard/courses/${activeCourseId}`}
                className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-3 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
              >
                <Play className="w-4 h-4 fill-[#ffe95c] text-[#ffe95c]" />
                <span>Resume Active Course</span>
              </Link>
            ) : (
              <Link
                href="/dashboard/courses"
                className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-3 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
              >
                <Compass className="w-4 h-4 text-[#ffe95c]" />
                <span>Browse Courses</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {realStats.map((s, idx) => (
          <StatCard
            key={idx}
            label={s.label}
            value={s.value}
            trend={s.trend}
            variant={s.variant}
          />
        ))}
      </div>

      {/* Continue Learning Featured Card (If enrolled in at least 1 course) */}
      {activeCourse && (
        <div className="bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[16px] p-6 shadow-sm">
          <SectionHeader
            title="Continue Learning"
            subtitle="Pick up right where you left off in your active course"
            badge="Active Course"
            badgeBg="bg-[#ffe95c]"
          />

          <div className="bg-[#d5f5c2]/30 border border-[#1a3300]/20 rounded-[12px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase tracking-wider">
                {activeCourse.category || "Development"} • Instructor: {activeCourse.instructor?.username || "SkillPulse Faculty"}
              </span>
              <h3
                className="text-[20px] font-bold text-[#1a3300]"
                style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
              >
                {activeCourse.title}
              </h3>

              {/* Progress Bar */}
              <div className="pt-2 max-w-[500px]">
                <div className="flex items-center justify-between text-[12px] font-mono text-[#1a3300]/80 mb-1.5">
                  <span>{activeCompletedCount} of {activeTotalLessons} lessons finished</span>
                  <span className="font-bold">{activePercentage}%</span>
                </div>
                <div className="w-full h-3 bg-[#1a3300]/10 rounded-full overflow-hidden border border-[#1a3300]/20">
                  <div
                    className="h-full bg-[#1a3300] rounded-full transition-all duration-500"
                    style={{ width: `${activePercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto">
              <Link
                href={`/dashboard/courses/${activeCourseId}`}
                className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-6 py-2.5 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-colors"
              >
                <span>Continue Course</span>
                <ArrowRight className="w-4 h-4 text-[#ffe95c]" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Grid: My Enrolled Courses & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Enrolled Courses */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader
            title="My Enrolled Courses"
            subtitle="Courses you are currently learning"
            actionText="View All"
            actionHref="/dashboard/my-learning"
          />

          {enrollments.length === 0 ? (
            <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 text-center">
              <BookOpen className="w-8 h-8 text-[#1a3300]/40 mx-auto mb-2" />
              <p className="text-[14px] text-[#1a3300]/70 font-medium mb-3">You have not enrolled in any courses yet.</p>
              <Link
                href="/dashboard/courses"
                className="inline-block bg-[#1a3300] text-[#fcfaf5] px-4 py-2 rounded-[6px] text-[13px] font-medium"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enrollments.slice(0, 4).map((en) => {
                const c = en.course;
                if (!c) return null;
                const cId = String(c.documentId || c.id);
                const pObj = progresses.find((p) => String(p.course?.documentId || p.course?.id || p.course) === cId);
                const pct = pObj?.percentage ?? 0;
                const cCount = pObj?.completed_count ?? 0;
                const tCount = pObj?.total_lessons ?? (c.lessons?.length || 0);

                return (
                  <div
                    key={en.id || cId}
                    className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-5 flex flex-col justify-between hover:border-[#1a3300] transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase tracking-wider">
                          {c.category || "Development"}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] border border-[#1a3300]/20 text-[#1a3300] bg-[#d5f5c2]">
                          {pct}% Done
                        </span>
                      </div>
                      <h4 className="font-bold text-[16px] text-[#1a3300] mb-2 leading-snug">
                        <Link href={`/dashboard/courses/${cId}`} className="hover:underline">
                          {c.title}
                        </Link>
                      </h4>
                      <p className="text-[12px] text-[#1a3300]/70 mb-4">
                        Instructor: {c.instructor?.username || "SkillPulse Educator"}
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-[#b6b6b6]/30">
                      <div className="flex items-center justify-between text-[12px] font-mono text-[#1a3300]/80">
                        <span>Progress: {cCount}/{tCount} lessons</span>
                        <span className="font-bold">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#1a3300]/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1a3300] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Learning Shortcuts */}
        <div className="space-y-4">
          <SectionHeader
            title="Learning Shortcuts"
            subtitle="Quick workspace actions"
          />

          <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-4 space-y-3 shadow-sm">
            <Link
              href="/dashboard/my-learning"
              className="w-full flex items-center justify-between p-3 rounded-[8px] bg-[#d5f5c2]/40 border border-[#1a3300]/20 hover:bg-[#d5f5c2]/70 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-[#1a3300]" />
                <div>
                  <span className="font-bold text-[14px] block leading-none mb-0.5">My Enrolled Courses</span>
                  <span className="text-[11px] font-mono text-[#1a3300]/70">Track progress & resume learning</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#1a3300]/60" />
            </Link>

            <Link
              href="/dashboard/courses"
              className="w-full flex items-center justify-between p-3 rounded-[8px] bg-[#ffe95c]/40 border border-[#1a3300]/20 hover:bg-[#ffe95c]/70 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-[#1a3300]" />
                <div>
                  <span className="font-bold text-[14px] block leading-none mb-0.5">Explore Course Catalog</span>
                  <span className="text-[11px] font-mono text-[#1a3300]/70">Discover new skill modules</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#1a3300]/60" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
