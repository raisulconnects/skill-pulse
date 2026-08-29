"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import {
  ArrowLeft,
  Users,
  Trophy,
  BookOpen,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Search,
} from "lucide-react";

export default function InstructorQuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const courseId = params?.id;
  const quizId = params?.quizId;
  const userRole = user?.user_role || "student";

  const [submissionsData, setSubmissionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole === "student") {
      router.replace("/dashboard");
      return;
    }

    async function loadSubmissions() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/quiz-attempts/quiz/${quizId}`);
        const data = await res.json();

        if (res.ok && data.data) {
          setSubmissionsData(data.data);
        } else {
          setError(data.error?.message || data.error || "Failed to load quiz submissions.");
        }
      } catch (err) {
        console.error("Error loading quiz submissions:", err);
        setError("An error occurred while loading quiz submissions.");
      } finally {
        setLoading(false);
      }
    }

    if (quizId) {
      loadSubmissions();
    }
  }, [authLoading, user, quizId, userRole]);

  const attempts = Array.isArray(submissionsData?.attempts) ? submissionsData.attempts : [];

  const filteredAttempts = attempts.filter((att) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (att.student?.username || "").toLowerCase();
    const email = (att.student?.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <DashboardShell userRole={userRole}>
      <div className="max-w-[950px] animate-in fade-in duration-200 space-y-6">
        {/* Top Breadcrumbs */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {submissionsData?.course?.title || "Course"}</span>
          </Link>

          <Link
            href={`/dashboard/courses/${courseId}/quizzes/${quizId}/edit`}
            className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 text-[#1a3300] px-4 py-2 rounded-[6px] text-[13px] font-medium hover:bg-[#ffe95c]/80 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Edit Quiz & Questions</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading student quiz submissions...</p>
          </div>
        ) : error ? (
          <div className="bg-[#fcd0d0] border-2 border-[#cb5521] rounded-[12px] p-6 text-center text-[#cb5521]">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold text-[18px] mb-1">Submissions Unavailable</h3>
            <p className="text-[14px] mb-4">{error}</p>
            <Link
              href={`/dashboard/courses/${courseId}`}
              className="inline-block bg-[#1a3300] text-[#fcfaf5] px-4 py-2 rounded-[6px] text-[13px] font-medium"
            >
              Return to Course Page
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#d5f5c2] border border-[#1a3300]/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] uppercase tracking-wider mb-2">
                  <Users className="w-3.5 h-3.5" />
                  Instructor Assessment Results
                </div>
                <h1
                  className="text-[24px] sm:text-[28px] font-bold text-[#1a3300]"
                  style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                >
                  {submissionsData?.quizTitle}
                </h1>
                <p className="text-[13px] font-mono text-[#1a3300]/60">
                  Course: {submissionsData?.course?.title}
                </p>
              </div>

              <div className="bg-[#1a3300]/5 border border-[#1a3300]/20 rounded-[10px] p-3.5 text-center shrink-0 min-w-[140px]">
                <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase block">Total Submissions</span>
                <span className="text-[24px] font-bold text-[#1a3300]">{attempts.length}</span>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#b6b6b6]/30">
                <h3
                  className="text-[18px] font-bold text-[#1a3300]"
                  style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                >
                  Student Performance List
                </h3>

                {/* Search Bar */}
                {attempts.length > 0 && (
                  <div className="relative max-w-[260px] w-full">
                    <Search className="w-4 h-4 text-[#1a3300]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search student..."
                      className="w-full bg-white border border-[#1a3300]/20 rounded-[6px] pl-9 pr-3 py-1.5 text-[13px] text-[#1a3300] placeholder-[#1a3300]/40 focus:outline-none focus:ring-1 focus:ring-[#1a3300]"
                    />
                  </div>
                )}
              </div>

              {filteredAttempts.length === 0 ? (
                <div className="p-8 text-center bg-[#1a3300]/5 rounded-[8px] border border-dashed border-[#1a3300]/20">
                  <Users className="w-8 h-8 text-[#1a3300]/40 mx-auto mb-2" />
                  <p className="text-[14px] text-[#1a3300]/70 font-medium">No student submissions found</p>
                  <p className="text-[12px] font-mono text-[#1a3300]/50 mt-1">
                    {searchQuery ? "No students matched your search criteria." : "Enrolled students have not submitted attempts for this quiz yet."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1a3300]/20 text-[11px] font-mono text-[#1a3300]/60 uppercase tracking-wider">
                        <th className="pb-3 pt-1 px-3">Student</th>
                        <th className="pb-3 pt-1 px-3">Score</th>
                        <th className="pb-3 pt-1 px-3">Percentage</th>
                        <th className="pb-3 pt-1 px-3">Submitted Date</th>
                        <th className="pb-3 pt-1 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#b6b6b6]/20">
                      {filteredAttempts.map((att) => (
                        <tr key={att.id} className="hover:bg-[#1a3300]/3 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-[14px] text-[#1a3300]">
                              {att.student?.username || "Student"}
                            </div>
                            <div className="text-[11px] font-mono text-[#1a3300]/60">
                              {att.student?.email || "No email"}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-[14px] text-[#1a3300]">
                            {att.score} / {att.total_questions}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-block bg-[#d5f5c2] border border-[#1a3300]/20 text-[#1a3300] font-mono font-bold text-[12px] px-2.5 py-0.5 rounded-[4px]">
                              {att.percentage}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[12px] font-mono text-[#1a3300]/70">
                            {new Date(att.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/dashboard/courses/${courseId}/quizzes/${quizId}/results/${att.id}`}
                              className="inline-flex items-center gap-1.5 text-[12px] font-mono font-medium px-3 py-1 rounded-[5px] bg-[#1a3300] text-[#fcfaf5] hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-xs"
                            >
                              <span>Review Attempt</span>
                              <ExternalLink className="w-3 h-3 text-[#ffe95c]" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
