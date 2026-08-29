"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, BookOpen, Users, Star, ArrowRight, Sparkles, CheckCircle2, Clock } from "lucide-react";
import StatCard from "../shared/StatCard";
import SectionHeader from "../shared/SectionHeader";
import { MOCK_INSTRUCTOR_DATA } from "@/lib/mock-dashboard-data";

export default function InstructorDashboard({ user }) {
  const { stats, myCourses, recentSubmissions } = MOCK_INSTRUCTOR_DATA;
  const username = user?.username || user?.email?.split("@")[0] || "Instructor";

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
            <p className="text-[15px] text-[#1a3300]/80 max-w-[600px]">
              Your courses have reached <strong className="font-bold text-[#1a3300]">1,240 active students</strong> this month across 4 published modules.
            </p>
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

      {/* Stats Row */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myCourses.map((course) => (
            <div
              key={course.id}
              className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-5 flex flex-col justify-between hover:border-[#1a3300] transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] border border-[#1a3300]/20 ${
                    course.status === "Published" ? "bg-[#d5f5c2] text-[#1a3300]" : "bg-[#f1f1f1] text-[#1a3300]/70"
                  }`}>
                    {course.status}
                  </span>
                  <span className="text-[12px] font-mono text-[#1a3300]/60">
                    Updated {course.lastUpdated}
                  </span>
                </div>

                <h4 className="font-bold text-[18px] text-[#1a3300] mb-3 leading-snug">
                  {course.title}
                </h4>

                <div className="grid grid-cols-3 gap-2 py-3 bg-[#fcfaf5] border border-[#1a3300]/15 rounded-[8px] px-3 mb-4 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-[#1a3300]/60 uppercase block">Students</span>
                    <span className="text-[14px] font-bold text-[#1a3300]">{course.students}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#1a3300]/60 uppercase block">Rating</span>
                    <span className="text-[14px] font-bold text-[#1a3300] flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-[#ffe95c] text-[#1a3300]" />
                      {course.rating || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#1a3300]/60 uppercase block">Lessons</span>
                    <span className="text-[14px] font-bold text-[#1a3300]">{course.lessons}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button className="text-[13px] font-medium text-[#1a3300] border border-[#1a3300] rounded-[6px] px-3.5 py-1.5 hover:bg-[#1a3300]/5 transition-colors">
                  Edit Content
                </button>
                <button className="text-[13px] font-medium text-[#1a3300]/80 hover:text-[#1a3300] flex items-center gap-1">
                  <span>View Roster</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Student Submissions & Activity */}
      <div className="space-y-4">
        <SectionHeader
          title="Recent Student Activity"
          subtitle="Real-time quiz results and submissions from your students"
        />

        <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-4 divide-y divide-[#b6b6b6]/30">
          {recentSubmissions.map((item, idx) => (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[14px] text-[#1a3300]">
                    {item.studentName}
                  </span>
                  <span className="text-[11px] font-mono text-[#1a3300]/60">
                    • {item.course}
                  </span>
                </div>
                <p className="text-[13px] text-[#1a3300]/80">
                  {item.action}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                <span className="text-[11px] font-mono text-[#1a3300]/60">
                  {item.time}
                </span>
                <span className="text-[12px] font-mono font-bold text-[#1a3300] bg-[#ffe95c] px-2.5 py-1 rounded-[4px] border border-[#1a3300]/20">
                  {item.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
