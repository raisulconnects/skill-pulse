"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import CourseCard from "@/components/courses/CourseCard";
import SectionHeader from "@/components/dashboard/shared/SectionHeader";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import DeleteCourseModal from "@/components/courses/DeleteCourseModal";
import { PlusCircle, Search, Compass, Sparkles, Filter } from "lucide-react";

const CATEGORIES = [
  "All",
  "Web Development",
  "UI/UX Design",
  "Backend & Databases",
  "DevOps & Cloud",
  "Data Science & AI",
];

export default function CoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [enrollingId, setEnrollingId] = useState(null);

  // Deletion modal state
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const userRole = user?.user_role || "student";

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch courses
      const resCourses = await fetch("/api/courses");
      const dataCourses = await resCourses.json();
      const courseList = Array.isArray(dataCourses.data) ? dataCourses.data : (Array.isArray(dataCourses) ? dataCourses : []);
      setCourses(courseList);

      // 2. If student, fetch user enrollments to know which courses are already enrolled
      if (user && userRole === "student") {
        const resEnroll = await fetch("/api/enrollments");
        const dataEnroll = await resEnroll.json();
        const enrollList = Array.isArray(dataEnroll.data) ? dataEnroll.data : (Array.isArray(dataEnroll) ? dataEnroll : []);
        const enrolledIds = new Set();
        enrollList.forEach((en) => {
          const cId = en.course?.documentId || en.course?.id || en.course;
          if (cId) enrolledIds.add(String(cId));
        });
        setEnrolledCourseIds(enrolledIds);
      }
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, user]);

  const handleEnroll = async (courseId) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setEnrollingId(courseId);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: courseId }),
      });
      const data = await res.json();

      if (res.ok) {
        setEnrolledCourseIds((prev) => new Set([...prev, String(courseId)]));
      } else {
        alert(data.error?.message || data.error || "Enrollment failed.");
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      alert("An unexpected error occurred while enrolling.");
    } finally {
      setEnrollingId(null);
    }
  };

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

  // Filter courses by search and category
  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toString()?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardShell userRole={userRole}>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#b6b6b6]/30">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] mb-2 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Course Catalog</span>
            </div>
            <h1
              className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              {userRole === "admin" ? "All Platform Courses" : "Explore Courses"}
            </h1>
            <p className="text-[14px] text-[#1a3300]/75">
              Discover industry-focused learning tracks and build hands-on skills.
            </p>
          </div>

          {userRole !== "student" && (
            <Link
              href="/dashboard/courses/create"
              className="inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-2.5 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4 text-[#ffe95c]" />
              <span>Create Course</span>
            </Link>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[12px]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-[6px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#1a3300] text-[#fcfaf5]"
                    : "bg-[#fcfaf5] border border-[#1a3300]/20 text-[#1a3300]/70 hover:text-[#1a3300] hover:bg-[#1a3300]/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1a3300]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
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
            description={
              searchQuery || selectedCategory !== "All"
                ? "Try adjusting your search query or category filter."
                : "There are no published courses available at this time."
            }
            actionText={userRole !== "student" ? "Create First Course" : undefined}
            onActionClick={
              userRole !== "student"
                ? () => (window.location.href = "/dashboard/courses/create")
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const cId = String(course.documentId || course.id);
              const isEnrolled = enrolledCourseIds.has(cId);

              return (
                <CourseCard
                  key={cId}
                  course={course}
                  userRole={userRole}
                  isEnrolled={isEnrolled}
                  onEnroll={handleEnroll}
                  isEnrolling={enrollingId === course.documentId || enrollingId === course.id}
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
