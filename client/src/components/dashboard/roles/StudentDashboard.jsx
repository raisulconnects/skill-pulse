"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Play, CheckCircle2, Trophy, Clock, ArrowRight, BookOpen } from "lucide-react";
import StatCard from "../shared/StatCard";
import SectionHeader from "../shared/SectionHeader";
import { MOCK_STUDENT_DATA } from "@/lib/mock-dashboard-data";

export default function StudentDashboard({ user }) {
  const { stats, continueCourse, enrolledCourses, recentQuizzes } = MOCK_STUDENT_DATA;
  const username = user?.username || user?.email?.split("@")[0] || "Student";

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
              You're making great progress! You have <strong className="font-bold text-[#1a3300]">1 active lesson</strong> ready to continue today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="#continue"
              className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-3 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
            >
              <Play className="w-4 h-4 fill-[#ffe95c] text-[#ffe95c]" />
              <span>Resume Lesson</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <StatCard
            key={idx}
            label={s.label}
            value={s.value}
            trend={s.trend}
            variant={s.variant}
          />
        ))}
      </div>

      {/* Continue Learning Featured Card */}
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
              {continueCourse.category || "Web Development"} • Instructor: {continueCourse.instructor}
            </span>
            <h3
              className="text-[20px] font-bold text-[#1a3300]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              {continueCourse.title}
            </h3>
            <p className="text-[14px] text-[#1a3300]/80 font-medium">
              📍 {continueCourse.nextLesson}
            </p>

            {/* Progress Bar */}
            <div className="pt-2 max-w-[500px]">
              <div className="flex items-center justify-between text-[12px] font-mono text-[#1a3300]/80 mb-1.5">
                <span>{continueCourse.completedLessons} of {continueCourse.totalLessons} lessons finished</span>
                <span className="font-bold">{continueCourse.progressPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-[#1a3300]/10 rounded-full overflow-hidden border border-[#1a3300]/20">
                <div
                  className="h-full bg-[#1a3300] rounded-full transition-all duration-500"
                  style={{ width: `${continueCourse.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto">
            <span className="inline-flex items-center gap-1 text-[12px] font-mono text-[#1a3300]/70 self-start md:self-end">
              <Clock className="w-3.5 h-3.5" />
              ~{continueCourse.estimatedMinutesRemaining} mins remaining
            </span>
            <button className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-6 py-2.5 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-colors">
              <span>Start Lesson 4.2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: My Enrolled Courses & Recent Quiz Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Enrolled Courses */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader
            title="My Enrolled Courses"
            subtitle="Courses you are currently learning"
            actionText="Browse All"
            actionHref="/dashboard/courses"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enrolledCourses.map((c) => (
              <div
                key={c.id}
                className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-5 flex flex-col justify-between hover:border-[#1a3300] transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase tracking-wider">
                      {c.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] border border-[#1a3300]/20 text-[#1a3300] ${c.badgeBg}`}>
                      {c.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-[16px] text-[#1a3300] mb-2 leading-snug">
                    {c.title}
                  </h4>
                  <p className="text-[12px] text-[#1a3300]/70 mb-4">
                    Instructor: {c.instructor}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#b6b6b6]/30">
                  <div className="flex items-center justify-between text-[12px] font-mono text-[#1a3300]/80">
                    <span>Progress: {c.lessons}</span>
                    <span className="font-bold">{c.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1a3300]/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1a3300] rounded-full"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Quizzes */}
        <div className="space-y-4">
          <SectionHeader
            title="Quiz Activity"
            subtitle="Your recent test performance"
          />

          <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-4 divide-y divide-[#b6b6b6]/30">
            {recentQuizzes.map((q, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <h5 className="font-bold text-[13px] text-[#1a3300] truncate">
                    {q.title}
                  </h5>
                  <p className="text-[11px] font-mono text-[#1a3300]/60 truncate">
                    {q.course} • {q.date}
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[14px] font-mono font-bold text-[#1a3300] bg-[#d5f5c2] px-2 py-0.5 rounded-[4px] border border-[#1a3300]/15">
                    {q.score}
                  </span>
                  <span className="text-[10px] text-[#1a3300]/60 mt-0.5">
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
