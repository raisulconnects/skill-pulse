"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import CourseCard from "@/components/courses/CourseCard";
import SectionHeader from "@/components/dashboard/shared/SectionHeader";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import { BookOpen, Compass, ArrowRight, Play, CheckCircle2 } from "lucide-react";

export default function MyLearningPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnrollments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/enrollments");
      const data = await res.json();
      const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setEnrollments(list);
    } catch (err) {
      console.error("Error loading enrollments:", err);
      setError("Failed to load your enrolled courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadEnrollments();
    }
  }, [authLoading, user]);

  return (
    <DashboardShell userRole="student">
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#b6b6b6]/30">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#d5f5c2] border border-[#1a3300]/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] mb-2 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Student Learning</span>
            </div>
            <h1
              className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              My Enrolled Courses
            </h1>
            <p className="text-[14px] text-[#1a3300]/75">
              Continue your courses and track your learning progress.
            </p>
          </div>

          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-2.5 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm self-start sm:self-auto"
          >
            <Compass className="w-4 h-4 text-[#ffe95c]" />
            <span>Browse More Courses</span>
          </Link>
        </div>

        {/* Enrollment List */}
        {loading ? (
          <div className="py-16 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading your enrolled courses...</p>
          </div>
        ) : error ? (
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-4 text-[#cb5521] text-[14px]">
            {error}
          </div>
        ) : enrollments.length === 0 ? (
          <EmptyState
            title="No Enrolled Courses Yet"
            description="You haven't enrolled in any courses yet. Explore our course catalog to start learning!"
            actionText="Explore Courses"
            onActionClick={() => (window.location.href = "/dashboard/courses")}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((en) => {
              const course = en.course;
              if (!course) return null;
              const courseId = course.documentId || course.id;

              return (
                <CourseCard
                  key={en.id || courseId}
                  course={course}
                  userRole="student"
                  isEnrolled={true}
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
