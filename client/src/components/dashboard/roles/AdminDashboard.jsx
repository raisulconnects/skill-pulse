"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  BookOpen,
  Settings,
  Sparkles,
  ArrowRight,
  GraduationCap,
  UserCheck,
  UserCog,
  Layers,
  Award,
  FileText,
} from "lucide-react";
import StatCard from "../shared/StatCard";
import SectionHeader from "../shared/SectionHeader";

export default function AdminDashboard({ user }) {
  const username = user?.username || user?.email?.split("@")[0] || "Administrator";

  const [realStats, setRealStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.totalUsers !== undefined) {
          setRealStats(data);
        } else {
          setError(data.error?.message || data.error || "Failed to load statistics.");
        }
      })
      .catch((err) => {
        console.error("Error loading admin stats:", err);
        setError("An error occurred while fetching platform statistics.");
      })
      .finally(() => setLoading(false));
  }, []);

  const totalUsers = realStats?.totalUsers || 0;
  const totalStudents = realStats?.totalStudents || 0;
  const totalInstructors = realStats?.totalInstructors || 0;
  const totalContentManagers = realStats?.totalContentManagers || 0;
  const totalAdmins = realStats?.totalAdmins || 0;
  const totalCourses = realStats?.totalCourses || 0;
  const totalEnrollments = realStats?.totalEnrollments || 0;

  const getPercentage = (count) => {
    if (!totalUsers) return "0";
    return ((count / totalUsers) * 100).toFixed(1);
  };

  const statCardsData = [
    {
      label: "Total Registered Users",
      value: loading ? "..." : totalUsers.toLocaleString(),
      trend: "Realtime DB",
      variant: "accent",
    },
    {
      label: "Total Students",
      value: loading ? "..." : totalStudents.toLocaleString(),
      trend: `${getPercentage(totalStudents)}% of users`,
      variant: "secondary",
    },
    {
      label: "Total Instructors",
      value: loading ? "..." : totalInstructors.toLocaleString(),
      trend: `${getPercentage(totalInstructors)}% of users`,
      variant: "primary",
    },
    {
      label: "Total Content Managers",
      value: loading ? "..." : totalContentManagers.toLocaleString(),
      trend: `${getPercentage(totalContentManagers)}% of users`,
      variant: "default",
    },
    {
      label: "Total Courses",
      value: loading ? "..." : totalCourses.toLocaleString(),
      trend: "Platform Catalog",
      variant: "primary",
    },
    {
      label: "Total Enrollments",
      value: loading ? "..." : totalEnrollments.toLocaleString(),
      trend: "Student Learning",
      variant: "accent",
    },
  ];

  const userRoleDistribution = [
    {
      role: "Students",
      count: totalStudents,
      percentage: getPercentage(totalStudents),
      color: "bg-[#d5f5c2]",
    },
    {
      role: "Instructors",
      count: totalInstructors,
      percentage: getPercentage(totalInstructors),
      color: "bg-[#ffe95c]",
    },
    {
      role: "Content Managers",
      count: totalContentManagers,
      percentage: getPercentage(totalContentManagers),
      color: "bg-[#a8e5e5]",
    },
    {
      role: "Administrators",
      count: totalAdmins,
      percentage: getPercentage(totalAdmins),
      color: "bg-[#f6d0ff]",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Admin Executive Header */}
      <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.05)_0px_4px_12px] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#f6d0ff] border border-[#1a3300]/20 px-3 py-1 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>System Executive Panel</span>
            </div>
            <h1
              className="text-[28px] sm:text-[36px] font-[800] text-[#1a3300] leading-tight tracking-[0.02em] mb-2"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              System Overview, <span className="bg-[#f6d0ff] px-2 py-0.5 rounded-[4px]">{username}</span>
            </h1>
            <p className="text-[15px] text-[#1a3300]/80 max-w-[600px]">
              Platform healthy. Real-time system analytics loaded directly from Strapi database.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/dashboard/admin/users"
              className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-3 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
            >
              <Users className="w-4 h-4 text-[#ffe95c]" />
              <span>User Management</span>
            </Link>
            <Link
              href="/dashboard/admin/courses"
              className="inline-flex items-center justify-center gap-2 bg-[#ffe95c] border border-[#1a3300] text-[#1a3300] px-5 py-3 rounded-[6px] text-[14px] font-bold hover:bg-[#ffe95c]/80 transition-transform active:scale-[0.98] shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-[#1a3300]" />
              <span>Admin Courses</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCardsData.map((s, idx) => (
          <StatCard
            key={idx}
            label={s.label}
            value={s.value}
            trend={s.trend}
            variant={s.variant}
          />
        ))}
      </div>

      {/* Grid: User Role Distribution & Quick Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: User Role Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader
            title="User Role Breakdown"
            subtitle="Real-time count of registered user roles in PostgreSQL"
            badge="Platform Security"
            badgeBg="bg-[#f6d0ff]"
          />

          <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 space-y-5 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {userRoleDistribution.map((item, idx) => (
                <div key={idx} className="bg-[#fcfaf5] border border-[#1a3300]/15 rounded-[8px] p-3">
                  <span className="text-[10px] font-mono text-[#1a3300]/60 uppercase block mb-1">
                    {item.role}
                  </span>
                  <span
                    className="text-[20px] font-bold text-[#1a3300] block"
                    style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                  >
                    {loading ? "..." : item.count.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-mono text-[#1a3300]/70">
                    {loading ? "..." : `${item.percentage}%`}
                  </span>
                </div>
              ))}
            </div>

            {/* Combined Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[12px] font-mono text-[#1a3300]/70">
                <span>Account Share Breakdown</span>
                <span>100% Total Ratio</span>
              </div>
              <div className="w-full h-4 bg-[#1a3300]/10 rounded-full overflow-hidden flex border border-[#1a3300]/20">
                {userRoleDistribution.map((item, idx) => (
                  <div
                    key={idx}
                    className={`h-full ${item.color} border-r border-[#1a3300]/20 last:border-0 transition-all duration-500`}
                    style={{ width: `${Math.max(Number(item.percentage) || 0, 2)}%` }}
                    title={`${item.role}: ${item.count} (${item.percentage}%)`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Admin Action Shortcuts */}
        <div className="space-y-4">
          <SectionHeader
            title="System Actions"
            subtitle="Administrative shortcuts"
          />

          <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-4 space-y-3 shadow-sm">
            <Link
              href="/dashboard/admin/users"
              className="w-full flex items-center justify-between p-3 rounded-[8px] bg-[#d5f5c2]/40 border border-[#1a3300]/20 hover:bg-[#d5f5c2]/70 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#1a3300]" />
                <div>
                  <span className="font-bold text-[14px] block leading-none mb-0.5">Manage Platform Users</span>
                  <span className="text-[11px] font-mono text-[#1a3300]/70">Roles, privileges & pagination</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#1a3300]/60" />
            </Link>

            <Link
              href="/dashboard/admin/courses"
              className="w-full flex items-center justify-between p-3 rounded-[8px] bg-[#ffe95c]/40 border border-[#1a3300]/20 hover:bg-[#ffe95c]/70 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-[#1a3300]" />
                <div>
                  <span className="font-bold text-[14px] block leading-none mb-0.5">Admin Course Management</span>
                  <span className="text-[11px] font-mono text-[#1a3300]/70">Manage all courses & lessons</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#1a3300]/60" />
            </Link>

            <Link
              href="/dashboard/blog"
              className="w-full flex items-center justify-between p-3 rounded-[8px] bg-[#f6d0ff]/40 border border-[#1a3300]/20 hover:bg-[#f6d0ff]/70 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-[#1a3300]" />
                <div>
                  <span className="font-bold text-[14px] block leading-none mb-0.5">Blog CMS & Authoring</span>
                  <span className="text-[11px] font-mono text-[#1a3300]/70">Draft, publish & edit platform posts</span>
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
