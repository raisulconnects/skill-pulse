"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Clock, BookOpen, Layers, ArrowRight, User, CheckCircle, Sparkles } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

export default function CourseShowcase() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function fetchTopCourses() {
      setLoading(true);
      try {
        const res = await fetch("/api/courses");
        const json = await res.json();
        const rawList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        
        // Take top 6 published courses
        const topSix = rawList.slice(0, 6);
        setCourses(topSix);
      } catch (err) {
        console.error("Failed to load home page featured courses:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopCourses();
  }, []);

  // Extract unique categories from fetched courses or default
  const availableCategories = ["All", ...new Set(courses.map((c) => c.category).filter(Boolean))];

  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter((c) => c.category === selectedCategory);

  return (
    <section id="courses" className="py-16 md:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <FadeIn direction="up">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-block bg-[#ffe95c] px-3 py-0.5 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider">
              Explore Catalog
            </div>
            <h2
              className="text-[32px] sm:text-[44px] font-[800] text-[#1a3300] leading-tight tracking-[0.03em]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Featured <span className="marker-highlight">Top Courses</span>
            </h2>
          </div>
          <p className="text-[16px] text-[#1a3300]/80 max-w-[420px]">
            Hands-on curricula with interactive code playgrounds, quizzes, and capstones tested against real-world benchmarks.
          </p>
        </div>
      </FadeIn>

      {/* Category Filter Pills (rendered if categories exist) */}
      {availableCategories.length > 1 && (
        <FadeIn direction="up" delay={100}>
          <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-[#b6b6b6]/30">
            {availableCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-[6px] text-[14px] font-medium transition-all ${
                    isActive
                      ? "bg-[#1a3300] text-[#fcfaf5] shadow-xs"
                      : "bg-transparent text-[#1a3300] border border-[#b6b6b6]/60 hover:border-[#1a3300] hover:bg-[#1a3300]/5"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </FadeIn>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#fcfaf5] border border-[#1a3300]/20 rounded-[12px] p-6 animate-pulse space-y-4">
              <div className="h-4 bg-[#1a3300]/10 rounded w-1/3" />
              <div className="h-6 bg-[#1a3300]/15 rounded w-3/4" />
              <div className="h-12 bg-[#1a3300]/5 rounded w-full" />
              <div className="h-10 bg-[#1a3300]/10 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-12 text-center bg-[#fcfaf5] border border-[#1a3300]/20 rounded-[12px] p-8 mb-12">
          <p className="text-[16px] text-[#1a3300]/70">No courses match the selected filter right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {filteredCourses.map((course, idx) => {
            const courseId = course.documentId || course.id;
            const title = course.title || "Untitled Course";
            const category = course.category || "Development";
            const instructorName = course.instructor?.username || (typeof course.instructor === "string" ? course.instructor : "SkillPulse Faculty");
            
            let descriptionText = "";
            if (typeof course.description === "string") {
              descriptionText = course.description;
            } else if (Array.isArray(course.description)) {
              descriptionText = course.description
                .map((block) => block?.children?.map((c) => c.text).join("") || "")
                .join(" ");
            }

            const lessonCount = Array.isArray(course.lessons) ? course.lessons.length : (course.lessons_count || 0);
            const enrollmentCount = Array.isArray(course.enrollments) ? course.enrollments.length : 0;

            return (
              <FadeIn key={courseId} direction="up" delay={idx * 80}>
                <div className="bg-[#fcfaf5] border border-[#1a3300]/80 rounded-[12px] p-6 flex flex-col justify-between hover:border-[#1a3300] transition-all card-hover-lift shadow-[rgba(0,0,0,0.04)_0px_2px_4px] h-full group">
                  <div>
                    {/* Card Header Badges */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-[4px] font-semibold border border-[#1a3300]/15 bg-[#d5f5c2] text-[#1a3300]">
                        {category}
                      </span>
                      <span className="text-[11px] font-mono text-[#1a3300]/70 bg-[#1a3300]/5 px-2 py-0.5 rounded-[4px]">
                        Published
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-[19px] sm:text-[20px] font-bold text-[#1a3300] leading-snug mb-2 line-clamp-2">
                      {title}
                    </h3>

                    {/* Course Description */}
                    <p className="text-[14px] text-[#1a3300]/75 leading-relaxed mb-5 line-clamp-2">
                      {descriptionText || "Master hands-on concepts with guided lessons and milestone challenges."}
                    </p>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-2 text-[12px] font-mono text-[#1a3300]/80 py-3 border-y border-[#b6b6b6]/30 mb-4">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#1a3300]" />
                        <span>{lessonCount} lessons</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#1a3300]" />
                        <span>{enrollmentCount} enrolled</span>
                      </div>
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="w-7 h-7 rounded-full bg-[#1a3300] text-[#fcfaf5] flex items-center justify-center text-[11px] font-bold">
                        {instructorName[0]?.toUpperCase() || "I"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-[#1a3300] leading-none">
                          {instructorName}
                        </span>
                        <span className="text-[11px] text-[#1a3300]/60 mt-0.5 leading-none">
                          Verified Instructor
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#b6b6b6]/20">
                    <div>
                      <span className="text-[11px] font-mono text-[#1a3300]/60 block leading-none mb-1">
                        Access
                      </span>
                      <span className="text-[15px] font-bold text-[#1a3300] leading-none font-mono">
                        Included
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/courses/${courseId}`}
                      className="btn-interactive inline-flex items-center gap-1.5 bg-[#1a3300] text-[#fcfaf5] text-[13px] font-medium px-4 py-2 rounded-[6px] hover:bg-[#1a3300]/95 group"
                    >
                      <span>View Course</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#ffe95c] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}

      {/* Explore catalog button */}
      <FadeIn direction="up">
        <div className="text-center">
          <Link
            href="/dashboard/courses"
            className="btn-interactive inline-flex items-center gap-2 border-2 border-[#1a3300] bg-transparent text-[#1a3300] text-[15px] font-semibold px-6 py-3 rounded-[6px] hover:bg-[#1a3300] hover:text-[#fcfaf5] group"
          >
            <span>View All Platform Courses</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
