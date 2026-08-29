"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import CourseCard from "@/components/courses/CourseCard";
import DeleteCourseModal from "@/components/courses/DeleteCourseModal";
import { PlusCircle, BookOpen, Search, ArrowLeft, Sparkles, Filter } from "lucide-react";

export default function AdminCoursesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userRole = user?.user_role || "student";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      setCourses(list);
    } catch (err) {
      console.error("Error loading courses for admin:", err);
      setError("Failed to load platform courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user || (userRole !== "admin" && userRole !== "content_manager")) {
      router.replace("/dashboard");
      return;
    }

    loadCourses();
  }, [authLoading, user, userRole]);

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    const courseId = courseToDelete.documentId || courseToDelete.id;

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCourses((prev) => prev.filter((c) => (c.documentId || c.id) !== courseId));
        setCourseToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error?.message || data.error || "Failed to delete course.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting the course.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesStatus =
      statusFilter === "all" || (c.course_status || "published") === statusFilter;
    const instructorName = c.instructor?.username || c.instructor?.email || "";
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardShell userRole="admin">
      <div className="max-w-[1000px] animate-in fade-in duration-200 space-y-6">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard Overview</span>
          </Link>
        </div>

        {/* Header Banner */}
        <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 px-3 py-1 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>System Executive Panel</span>
            </div>
            <h1
              className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Admin Course Management
            </h1>
            <p className="text-[14px] text-[#1a3300]/80 mt-1 max-w-[600px]">
              Full administrative oversight to create, edit, manage lessons, and delete any course across the platform.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/courses/create"
              className="inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-3 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#ffe95c]" />
              <span>Create Course</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-4 text-[#cb5521] text-[14px]">
            {error}
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-mono text-[12px]">
            {["all", "published", "draft"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-[6px] font-medium capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-[#1a3300] text-[#fcfaf5]"
                    : "bg-[#fcfaf5] border border-[#1a3300]/20 text-[#1a3300]/70 hover:text-[#1a3300] hover:bg-[#1a3300]/5"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1a3300]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, or instructor..."
              className="w-full bg-white border border-[#1a3300]/30 rounded-[6px] pl-9 pr-4 py-2 text-[13px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:border-[#1a3300] transition-colors"
            />
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="py-16 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading platform courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-8 text-center bg-[#1a3300]/5 rounded-[12px] border border-dashed border-[#1a3300]/20">
            <BookOpen className="w-8 h-8 text-[#1a3300]/40 mx-auto mb-2" />
            <p className="text-[14px] text-[#1a3300]/70 font-medium">No courses found</p>
            <p className="text-[12px] font-mono text-[#1a3300]/50 mt-1">
              No courses matched your current status filter or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const cId = String(course.documentId || course.id);
              return (
                <CourseCard
                  key={cId}
                  course={course}
                  userRole="admin"
                  onDelete={(c) => setCourseToDelete(c)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteCourseModal
        isOpen={!!courseToDelete}
        courseTitle={courseToDelete?.title || ""}
        onConfirm={handleDeleteConfirm}
        onClose={() => setCourseToDelete(null)}
        isDeleting={isDeleting}
      />
    </DashboardShell>
  );
}
