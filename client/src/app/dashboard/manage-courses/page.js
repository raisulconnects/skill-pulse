"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import CourseCard from "@/components/courses/CourseCard";
import SectionHeader from "@/components/dashboard/shared/SectionHeader";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import DeleteCourseModal from "@/components/courses/DeleteCourseModal";
import { PlusCircle, Layers, Search } from "lucide-react";

export default function ManageCoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
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
      const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setCourses(list);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadCourses();
    }
  }, [authLoading, user]);

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
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardShell userRole="content_manager">
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#b6b6b6]/30">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#a8e5e5] border border-[#1a3300]/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] mb-2 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Content Moderation</span>
            </div>
            <h1
              className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Manage Platform Courses
            </h1>
            <p className="text-[14px] text-[#1a3300]/75">
              Review, edit, publish, or delete learning content across the platform.
            </p>
          </div>

          <Link
            href="/dashboard/courses/create"
            className="inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-2.5 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-[#ffe95c]" />
            <span>Create Course</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1a3300]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or category..."
              className="w-full bg-[#fcfaf5] border border-[#1a3300]/30 rounded-[6px] pl-9 pr-4 py-1.5 text-[13px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:border-[#1a3300] transition-colors"
            />
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="py-16 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-4 text-[#cb5521] text-[14px]">
            {error}
          </div>
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            title="No Courses Found"
            description="There are no courses matching your selected filter."
            actionText="Create Course"
            onActionClick={() => (window.location.href = "/dashboard/courses/create")}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const cId = String(course.documentId || course.id);
              return (
                <CourseCard
                  key={cId}
                  course={course}
                  userRole="content_manager"
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
