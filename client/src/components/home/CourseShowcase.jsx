"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Clock, BookOpen, Layers, ArrowRight, User, CheckCircle } from "lucide-react";

export default function CourseShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Courses" },
    { id: "fullstack", label: "Full-Stack Web" },
    { id: "ai", label: "AI & LLM Systems" },
    { id: "cloud", label: "Cloud & DevOps" },
    { id: "systems", label: "System Design" },
  ];

  const courses = [
    {
      id: "course-1",
      category: "fullstack",
      categoryLabel: "Full-Stack",
      categoryColor: "bg-[#d5f5c2] text-[#1a3300]",
      level: "Intermediate",
      title: "Production Next.js 15 & Strapi Masterclass",
      description: "Build robust full-stack web applications with Next.js App Router, Strapi CMS, PostgreSQL, and auth.",
      instructor: {
        name: "Marcus Vance",
        role: "Principal Frontend Architect",
      },
      rating: 4.9,
      reviewsCount: 342,
      lessonsCount: 48,
      duration: "14 hours",
      studentsCount: "3.2k",
      price: "$69",
      isPopular: true,
    },
    {
      id: "course-2",
      category: "ai",
      categoryLabel: "AI & ML",
      categoryColor: "bg-[#a8e5e5] text-[#1a3300]",
      level: "Advanced",
      title: "Building Production AI Agents with LangGraph & Python",
      description: "Design autonomous AI agents, tool-calling pipelines, vector embeddings, and evaluation loops.",
      instructor: {
        name: "Dr. Elena Rostova",
        role: "AI Research Lead",
      },
      rating: 4.95,
      reviewsCount: 512,
      lessonsCount: 36,
      duration: "11 hours",
      studentsCount: "4.8k",
      price: "$89",
      isPopular: true,
    },
    {
      id: "course-3",
      category: "systems",
      categoryLabel: "System Design",
      categoryColor: "bg-[#f6d0ff] text-[#1a3300]",
      level: "Advanced",
      title: "Distributed Systems & High-Scale Architecture",
      description: "Master caching strategies, message queues, database sharding, and fault tolerance at 1M+ req/sec.",
      instructor: {
        name: "Arjun Mehta",
        role: "Staff Engineer @ Fintech",
      },
      rating: 4.88,
      reviewsCount: 290,
      lessonsCount: 42,
      duration: "16 hours",
      studentsCount: "2.7k",
      price: "$99",
      isPopular: false,
    },
    {
      id: "course-4",
      category: "fullstack",
      categoryLabel: "Full-Stack",
      categoryColor: "bg-[#d5f5c2] text-[#1a3300]",
      level: "Beginner",
      title: "Interactive JavaScript & Modern DOM Mastery",
      description: "From core closures and promises to asynchronous execution and modern browser APIs.",
      instructor: {
        name: "Sarah Chen",
        role: "Senior Developer Advocate",
      },
      rating: 4.92,
      reviewsCount: 680,
      lessonsCount: 52,
      duration: "18 hours",
      studentsCount: "7.1k",
      price: "Free",
      isPopular: false,
    },
    {
      id: "course-5",
      category: "cloud",
      categoryLabel: "Cloud & DevOps",
      categoryColor: "bg-[#ffe95c] text-[#1a3300]",
      level: "Intermediate",
      title: "Kubernetes, Docker & CI/CD for Developers",
      description: "Containerize microservices, deploy on managed Kubernetes clusters, and automate zero-downtime releases.",
      instructor: {
        name: "Dave Miller",
        role: "DevOps Consultant",
      },
      rating: 4.86,
      reviewsCount: 198,
      lessonsCount: 30,
      duration: "9 hours",
      studentsCount: "1.9k",
      price: "$59",
      isPopular: false,
    },
    {
      id: "course-6",
      category: "systems",
      categoryLabel: "Databases",
      categoryColor: "bg-[#f6d0ff] text-[#1a3300]",
      level: "Intermediate",
      title: "PostgreSQL Internals, Indexing & Query Tuning",
      description: "Deep dive into query execution plans, B-trees, ACID transactions, and sub-millisecond query optimization.",
      instructor: {
        name: "Laura Schmidt",
        role: "Database Architect",
      },
      rating: 4.94,
      reviewsCount: 220,
      lessonsCount: 28,
      duration: "8 hours",
      studentsCount: "2.1k",
      price: "$75",
      isPopular: false,
    },
  ];

  const filteredCourses =
    selectedCategory === "all"
      ? courses
      : courses.filter((c) => c.category === selectedCategory);

  return (
    <section id="courses" className="py-16 md:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-block bg-[#ffe95c] px-3 py-0.5 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider">
            Explore Catalog
          </div>
          <h2 
            className="text-[32px] sm:text-[44px] font-[800] text-[#1a3300] leading-tight tracking-[0.03em]"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            Featured <span className="marker-highlight">Courses</span>
          </h2>
        </div>
        <p className="text-[16px] text-[#1a3300]/80 max-w-[420px]">
          Hands-on curricula with interactive code playgrounds, quizzes, and projects tested against industry benchmarks.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-[#b6b6b6]/30">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-[6px] text-[14px] font-medium transition-all ${
                isActive
                  ? "bg-[#1a3300] text-[#fcfaf5] shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px]"
                  : "bg-transparent text-[#1a3300] border border-[#b6b6b6]/60 hover:border-[#1a3300] hover:bg-[#1a3300]/5"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-[#fcfaf5] border border-[#1a3300]/80 rounded-[12px] p-6 flex flex-col justify-between hover:border-[#1a3300] transition-all sticky-card shadow-[rgba(0,0,0,0.04)_0px_2px_4px]"
          >
            <div>
              {/* Card Header with Badges */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded-[4px] font-semibold border border-[#1a3300]/15 ${course.categoryColor}`}
                >
                  {course.categoryLabel}
                </span>
                <span className="text-[11px] font-mono text-[#1a3300]/70 bg-[#1a3300]/5 px-2 py-0.5 rounded-[4px]">
                  {course.level}
                </span>
              </div>

              {/* Course Title */}
              <h3 className="text-[19px] sm:text-[20px] font-bold text-[#1a3300] leading-snug mb-2 line-clamp-2">
                {course.title}
              </h3>

              {/* Course Description */}
              <p className="text-[14px] text-[#1a3300]/75 leading-relaxed mb-5 line-clamp-2">
                {course.description}
              </p>

              {/* Meta stats */}
              <div className="grid grid-cols-2 gap-2 text-[12px] font-mono text-[#1a3300]/80 py-3 border-y border-[#b6b6b6]/30 mb-4">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#1a3300]" />
                  <span>{course.lessonsCount} lessons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#1a3300]" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-[#ffe95c] text-[#1a3300]" />
                  <span>{course.rating} ({course.reviewsCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#1a3300]" />
                  <span>{course.studentsCount} enrolled</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-7 h-7 rounded-full bg-[#1a3300] text-[#fcfaf5] flex items-center justify-center text-[11px] font-bold">
                  {course.instructor.name[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-[#1a3300] leading-none">
                    {course.instructor.name}
                  </span>
                  <span className="text-[11px] text-[#1a3300]/60 mt-0.5 leading-none">
                    {course.instructor.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between pt-3 border-t border-[#b6b6b6]/20">
              <div>
                <span className="text-[11px] font-mono text-[#1a3300]/60 block leading-none mb-1">
                  Tuition
                </span>
                <span className="text-[18px] font-bold text-[#1a3300] leading-none">
                  {course.price}
                </span>
              </div>
              <Link
                href={`/courses/${course.id}`}
                className="inline-flex items-center gap-1.5 bg-[#1a3300] text-[#fcfaf5] text-[13px] font-medium px-4 py-2 rounded-[6px] hover:bg-[#1a3300]/90 transition-colors"
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Explore catalog button */}
      <div className="text-center">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 border-2 border-[#1a3300] bg-transparent text-[#1a3300] text-[15px] font-semibold px-6 py-3 rounded-[6px] hover:bg-[#1a3300] hover:text-[#fcfaf5] transition-all"
        >
          <span>View All 120+ Courses</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
