"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, User, ArrowRight, Edit3, Trash2, CheckCircle2, Sparkles, Clock } from "lucide-react";

export default function CourseCard({
  course,
  userRole = "student",
  isEnrolled = false,
  progress = null,
  onEnroll,
  isEnrolling = false,
  onDelete,
}) {
  const {
    id,
    documentId,
    title,
    description,
    category = "Development",
    course_status = "published",
    instructor,
    thumbnail,
    thumbnail_url,
    enrollments,
    lessons,
  } = course;

  const courseId = documentId || id;
  const instructorName = instructor?.username || (typeof instructor === "string" ? instructor : "SkillPulse Faculty");

  // Extract description text if stored in Strapi blocks format
  let descriptionText = "";
  if (typeof description === "string") {
    descriptionText = description;
  } else if (Array.isArray(description)) {
    descriptionText = description
      .map((block) => block?.children?.map((c) => c.text).join("") || "")
      .join(" ");
  }

  const enrollmentCount = Array.isArray(enrollments) ? enrollments.length : 0;
  const lessonCount = Array.isArray(lessons) ? lessons.length : (course.lessons_count || 0);
  const progressPercentage = progress?.percentage ?? null;

  return (
    <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] overflow-hidden flex flex-col justify-between hover:border-[#1a3300] hover:shadow-[rgba(0,0,0,0.06)_0px_4px_12px] transition-all duration-200 group">
      {/* Thumbnail Banner */}
      <div className="h-40 bg-[#d5f5c2]/40 border-b border-[#1a3300]/15 relative overflow-hidden flex items-center justify-center">
        {thumbnail?.url || thumbnail_url ? (
          <img
            src={thumbnail?.url || thumbnail_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-[8px] bg-[#ffe95c] border border-[#1a3300]/20 flex items-center justify-center mx-auto mb-2 text-[#1a3300] shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono font-medium text-[#1a3300]/70 uppercase tracking-wider">
              {category}
            </span>
          </div>
        )}

        {/* Status Badge (for Admins, Content Managers, Instructors) */}
        {userRole !== "student" && (
          <div className="absolute top-3 right-3">
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-[4px] border uppercase shadow-xs ${
                course_status === "published"
                  ? "bg-[#d5f5c2] text-[#1a3300] border-[#1a3300]/20"
                  : "bg-[#ffe95c] text-[#1a3300] border-[#1a3300]/30"
              }`}
            >
              {course_status || "Draft"}
            </span>
          </div>
        )}

        {/* Enrolled Badge for Students */}
        {userRole === "student" && isEnrolled && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-[#d5f5c2] text-[#1a3300] text-[11px] font-mono font-bold px-2.5 py-1 rounded-[4px] border border-[#1a3300]/20 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{progressPercentage !== null ? `${progressPercentage}%` : "Enrolled"}</span>
            </span>
          </div>
        )}
      </div>

      {/* Course Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#1a3300]/60 uppercase tracking-wider mb-2">
            <span>{category}</span>
            {lessonCount > 0 && <span>{lessonCount} Lessons</span>}
          </div>

          <h3
            className="text-[18px] font-bold text-[#1a3300] leading-snug mb-2 group-hover:text-[#1a3300] transition-colors"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            <Link href={`/dashboard/courses/${courseId}`}>
              {title}
            </Link>
          </h3>

          {/* Progress Bar (If progress provided) */}
          {userRole === "student" && isEnrolled && progressPercentage !== null && (
            <div className="mb-3 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#1a3300]/80 mb-1">
                <span>Progress</span>
                <span className="font-bold">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-[#1a3300]/10 rounded-full overflow-hidden border border-[#1a3300]/15">
                <div
                  className="h-full bg-[#1a3300] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {descriptionText && (
            <p className="text-[13px] text-[#1a3300]/75 line-clamp-2 mb-4 leading-relaxed">
              {descriptionText}
            </p>
          )}
        </div>

        {/* Footer / Instructor info */}
        <div className="pt-4 border-t border-[#b6b6b6]/30">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#1a3300]/10 text-[#1a3300] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-[12px] font-medium text-[#1a3300]/80 truncate">
                {instructorName}
              </span>
            </div>

            {enrollmentCount > 0 && (
              <span className="text-[11px] font-mono text-[#1a3300]/60 shrink-0">
                {enrollmentCount} {enrollmentCount === 1 ? "student" : "students"}
              </span>
            )}
          </div>

          {/* Action Buttons based on Role */}
          <div className="flex items-center gap-2">
            {userRole === "student" ? (
              <>
                <Link
                  href={`/dashboard/courses/${courseId}`}
                  className="flex-1 text-center text-[13px] font-medium text-[#1a3300] border border-[#1a3300] rounded-[6px] py-2 hover:bg-[#1a3300]/5 transition-colors"
                >
                  View Details
                </Link>

                {isEnrolled ? (
                  <span className="flex-1 inline-flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#1a3300] bg-[#d5f5c2] border border-[#1a3300]/30 rounded-[6px] py-2 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                    <span>Enrolled ✓</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onEnroll && onEnroll(courseId)}
                    disabled={isEnrolling}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#fcfaf5] bg-[#1a3300] rounded-[6px] py-2 hover:bg-[#1a3300]/90 transition-all disabled:opacity-50"
                  >
                    <span>{isEnrolling ? "Enrolling..." : "Enroll Now"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            ) : (
              <>
                <Link
                  href={`/dashboard/courses/${courseId}`}
                  className="flex-1 text-center text-[13px] font-medium text-[#1a3300] border border-[#1a3300] rounded-[6px] py-2 hover:bg-[#1a3300]/5 transition-colors"
                >
                  View
                </Link>

                <Link
                  href={`/dashboard/courses/${courseId}/edit`}
                  className="inline-flex items-center justify-center gap-1 text-[13px] font-medium text-[#1a3300] bg-[#ffe95c] border border-[#1a3300]/20 rounded-[6px] px-3.5 py-2 hover:bg-[#ffe95c]/80 transition-colors"
                  title="Edit Course"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>

                {onDelete && (
                  <button
                    onClick={() => onDelete(course)}
                    className="inline-flex items-center justify-center p-2 text-[#cb5521] border border-[#cb5521]/30 rounded-[6px] hover:bg-[#cb5521]/10 transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
