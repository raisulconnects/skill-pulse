"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import {
  ArrowLeft,
  History,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export default function StudentQuizHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const courseId = params?.id;
  const quizId = params?.quizId;
  const userRole = user?.user_role || "student";

  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "student") {
      router.replace("/dashboard");
      return;
    }

    async function loadHistory() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/quiz-attempts/quiz/${quizId}`);
        const data = await res.json();

        if (res.ok && data.data) {
          setHistoryData(data.data);
        } else {
          setError(data.error?.message || data.error || "Attempt history unavailable.");
        }
      } catch (err) {
        console.error("Error loading attempt history:", err);
        setError("Failed to load attempt history.");
      } finally {
        setLoading(false);
      }
    }

    if (quizId) {
      loadHistory();
    }
  }, [authLoading, user, quizId, userRole]);

  const attempts = Array.isArray(historyData?.attempts) ? historyData.attempts : [];

  return (
    <DashboardShell userRole="student">
      <div className="max-w-[800px] animate-in fade-in duration-200 space-y-6">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Course</span>
          </Link>

          <Link
            href={`/dashboard/courses/${courseId}/quizzes/${quizId}/take`}
            className="inline-flex items-center gap-1.5 bg-[#1a3300] text-[#fcfaf5] px-4 py-2 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#ffe95c]" />
            <span>Take Quiz Again</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading attempt history...</p>
          </div>
        ) : error ? (
          <div className="bg-[#fcd0d0] border-2 border-[#cb5521] rounded-[12px] p-6 text-center text-[#cb5521]">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold text-[18px] mb-1">History Unavailable</h3>
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
            <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] uppercase tracking-wider mb-2">
                  <History className="w-3.5 h-3.5" />
                  Attempt History
                </div>
                <h1
                  className="text-[24px] font-bold text-[#1a3300]"
                  style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                >
                  {historyData?.quizTitle}
                </h1>
                <p className="text-[12px] font-mono text-[#1a3300]/60">
                  Course: {historyData?.course?.title}
                </p>
              </div>

              <div className="bg-[#1a3300]/5 border border-[#1a3300]/20 rounded-[10px] p-3 text-center shrink-0">
                <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase block">Total Attempts</span>
                <span className="text-[20px] font-bold text-[#1a3300]">{attempts.length}</span>
              </div>
            </div>

            {/* Attempts List */}
            <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 shadow-sm space-y-4">
              <h3
                className="text-[18px] font-bold text-[#1a3300] pb-3 border-b border-[#b6b6b6]/30"
                style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
              >
                Previous Submissions
              </h3>

              {attempts.length === 0 ? (
                <div className="p-8 text-center bg-[#1a3300]/5 rounded-[8px] border border-dashed border-[#1a3300]/20">
                  <History className="w-8 h-8 text-[#1a3300]/40 mx-auto mb-2" />
                  <p className="text-[14px] text-[#1a3300]/70 font-medium">No previous attempts found</p>
                  <p className="text-[12px] font-mono text-[#1a3300]/50 mt-1 mb-4">
                    Take the quiz for the first time to track your performance.
                  </p>
                  <Link
                    href={`/dashboard/courses/${courseId}/quizzes/${quizId}/take`}
                    className="inline-block bg-[#1a3300] text-[#fcfaf5] px-4 py-2 rounded-[6px] text-[13px] font-medium"
                  >
                    Start Quiz Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {attempts.map((att) => (
                    <div
                      key={att.id}
                      className="bg-white border border-[#1a3300]/20 rounded-[10px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1a3300] transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="w-9 h-9 rounded-[8px] bg-[#1a3300] text-[#fcfaf5] text-[13px] font-mono font-bold flex items-center justify-center shrink-0">
                          #{att.attempt_number}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[15px] text-[#1a3300]">
                              Score: {att.score} / {att.total_questions}
                            </span>
                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[#ffe95c] border border-[#1a3300]/20 text-[#1a3300]">
                              {att.percentage}%
                            </span>
                          </div>
                          <span className="text-[12px] font-mono text-[#1a3300]/60 block mt-0.5">
                            Submitted on {new Date(att.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/courses/${courseId}/quizzes/${quizId}/results/${att.id}`}
                        className="inline-flex items-center justify-center gap-1.5 text-[12px] font-mono font-medium px-4 py-2 rounded-[6px] bg-[#d5f5c2] border border-[#1a3300]/20 text-[#1a3300] hover:bg-[#d5f5c2]/80 transition-colors shrink-0"
                      >
                        <span>Review Answers</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
