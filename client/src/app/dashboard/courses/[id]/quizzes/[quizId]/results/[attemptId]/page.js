"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  BookOpen,
  History,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export default function QuizAttemptReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const courseId = params?.id;
  const quizId = params?.quizId;
  const attemptId = params?.attemptId;
  const userRole = user?.user_role || "student";

  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "correct", "incorrect"

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    async function loadAttemptReview() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/quiz-attempts/${attemptId}`);
        const data = await res.json();

        if (res.ok && data.data) {
          setReviewData(data.data);
        } else {
          setError(data.error?.message || data.error || "Attempt review not found.");
        }
      } catch (err) {
        console.error("Error loading attempt review:", err);
        setError("Failed to load attempt review.");
      } finally {
        setLoading(false);
      }
    }

    if (attemptId) {
      loadAttemptReview();
    }
  }, [authLoading, user, attemptId]);

  const optionLabels = ["A", "B", "C", "D"];

  const questionsToDisplay = (reviewData?.review_questions || []).filter((q) => {
    if (filter === "correct") return q.is_correct;
    if (filter === "incorrect") return !q.is_correct;
    return true;
  });

  return (
    <DashboardShell userRole={userRole}>
      <div className="max-w-[850px] animate-in fade-in duration-200 space-y-6">
        {/* Top Breadcrumbs */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Course</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading attempt review...</p>
          </div>
        ) : error || !reviewData ? (
          <div className="bg-[#fcd0d0] border-2 border-[#cb5521] rounded-[12px] p-6 text-center text-[#cb5521]">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold text-[18px] mb-1">Review Unavailable</h3>
            <p className="text-[14px] mb-4">{error || "Could not load attempt details."}</p>
            <Link
              href={`/dashboard/courses/${courseId}`}
              className="inline-block bg-[#1a3300] text-[#fcfaf5] px-4 py-2 rounded-[6px] text-[13px] font-medium"
            >
              Return to Course
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score & Summary Banner */}
            <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.06)_0px_8px_24px] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-[#d5f5c2] border border-[#1a3300]/20 px-3 py-1 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Quiz Result Review
                  </span>
                  <h1
                    className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight mb-1"
                    style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                  >
                    {reviewData.quiz?.title}
                  </h1>
                  <p className="text-[13px] font-mono text-[#1a3300]/60">
                    Submitted on {new Date(reviewData.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {userRole !== "student" && ` • Student: ${reviewData.student?.username}`}
                  </p>
                </div>

                {/* Score Widget */}
                <div className="bg-[#1a3300]/5 border border-[#1a3300]/20 rounded-[12px] p-5 text-center shrink-0 min-w-[200px]">
                  <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase block mb-1">
                    Score Achieved
                  </span>
                  <div
                    className="text-[36px] font-[800] text-[#1a3300] leading-none mb-2"
                    style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                  >
                    {reviewData.score} <span className="text-[20px] text-[#1a3300]/50">/ {reviewData.total_questions}</span>
                  </div>
                  <span className="inline-block bg-[#ffe95c] text-[#1a3300] border border-[#1a3300]/20 text-[13px] font-mono font-bold px-3 py-0.5 rounded-[4px]">
                    {reviewData.percentage}% Score
                  </span>
                </div>
              </div>

              {/* Stats Breakdown Row */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#b6b6b6]/30">
                <div className="bg-white border border-[#1a3300]/20 rounded-[8px] p-3 text-center">
                  <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase block">Total</span>
                  <span className="text-[16px] font-bold text-[#1a3300]">{reviewData.total_questions} Questions</span>
                </div>
                <div className="bg-[#d5f5c2]/40 border border-[#1a3300]/20 rounded-[8px] p-3 text-center">
                  <span className="text-[11px] font-mono text-[#1a3300]/80 uppercase block font-bold">Correct</span>
                  <span className="text-[16px] font-bold text-[#1a3300]">✓ {reviewData.correct_count}</span>
                </div>
                <div className="bg-[#fcd0d0]/40 border border-[#cb5521]/30 rounded-[8px] p-3 text-center">
                  <span className="text-[11px] font-mono text-[#cb5521] uppercase block font-bold">Incorrect</span>
                  <span className="text-[16px] font-bold text-[#cb5521]">✕ {reviewData.incorrect_count}</span>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/courses/${courseId}`}
                    className="inline-flex items-center gap-1.5 bg-[#1a3300]/5 text-[#1a3300] border border-[#1a3300]/20 px-4 py-2 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/10 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Back to Course</span>
                  </Link>

                  {userRole === "student" && (
                    <Link
                      href={`/dashboard/courses/${courseId}/quizzes/${quizId}/history`}
                      className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 text-[#1a3300] px-4 py-2 rounded-[6px] text-[13px] font-medium hover:bg-[#ffe95c]/80 transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Attempt History</span>
                    </Link>
                  )}
                </div>

                {userRole === "student" && (
                  <Link
                    href={`/dashboard/courses/${courseId}/quizzes/${quizId}/take`}
                    className="inline-flex items-center gap-1.5 bg-[#1a3300] text-[#fcfaf5] px-5 py-2 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#ffe95c]" />
                    <span>Try Again</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Answer Review Section */}
            <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#b6b6b6]/30">
                <div>
                  <h3
                    className="text-[18px] font-bold text-[#1a3300]"
                    style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                  >
                    Detailed Answer Breakdown
                  </h3>
                  <p className="text-[12px] font-mono text-[#1a3300]/60">
                    Review your choices and correct answers
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#1a3300]/5 p-1 rounded-[6px] border border-[#1a3300]/10 text-[12px] font-mono">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1 rounded-[4px] transition-colors ${
                      filter === "all" ? "bg-[#1a3300] text-[#fcfaf5] font-bold" : "text-[#1a3300]/70 hover:text-[#1a3300]"
                    }`}
                  >
                    All ({reviewData.review_questions?.length})
                  </button>
                  <button
                    onClick={() => setFilter("correct")}
                    className={`px-3 py-1 rounded-[4px] transition-colors ${
                      filter === "correct" ? "bg-[#1a3300] text-[#fcfaf5] font-bold" : "text-[#1a3300]/70 hover:text-[#1a3300]"
                    }`}
                  >
                    Correct ({reviewData.correct_count})
                  </button>
                  <button
                    onClick={() => setFilter("incorrect")}
                    className={`px-3 py-1 rounded-[4px] transition-colors ${
                      filter === "incorrect" ? "bg-[#1a3300] text-[#fcfaf5] font-bold" : "text-[#1a3300]/70 hover:text-[#1a3300]"
                    }`}
                  >
                    Incorrect ({reviewData.incorrect_count})
                  </button>
                </div>
              </div>

              {/* Questions Review List */}
              <div className="space-y-4">
                {questionsToDisplay.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className={`border-2 rounded-[12px] p-5 space-y-4 ${
                      q.is_correct
                        ? "bg-[#d5f5c2]/15 border-[#1a3300]/25"
                        : "bg-[#fcd0d0]/15 border-[#cb5521]/40"
                    }`}
                  >
                    {/* Question Header & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-[6px] bg-[#1a3300] text-[#fcfaf5] text-[12px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {q.order}
                        </span>
                        <h4 className="font-bold text-[15px] text-[#1a3300] leading-snug">
                          {q.question_text}
                        </h4>
                      </div>

                      {q.is_correct ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-[4px] bg-[#d5f5c2] border border-[#1a3300]/20 text-[#1a3300] shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-[4px] bg-[#fcd0d0] border border-[#cb5521]/40 text-[#cb5521] shrink-0">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((optText, optIdx) => {
                        const isSelected = optText === q.selected_answer;
                        const isCorrectOption = optText === q.correct_option;

                        let styleClasses = "bg-white border-[#1a3300]/20 text-[#1a3300]/70";
                        if (isCorrectOption) {
                          styleClasses = "bg-[#d5f5c2] border-[#1a3300] text-[#1a3300] font-medium shadow-xs";
                        } else if (isSelected && !q.is_correct) {
                          styleClasses = "bg-[#fcd0d0] border-[#cb5521] text-[#cb5521] font-medium";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2.5 p-3 rounded-[8px] border text-[13px] ${styleClasses}`}
                          >
                            <span className="font-mono font-bold text-[11px] opacity-70 shrink-0">
                              {optionLabels[optIdx]}
                            </span>
                            <span className="flex-1 truncate">{optText}</span>

                            {isCorrectOption && (
                              <span className="text-[10px] font-mono font-bold uppercase bg-[#1a3300] text-[#fcfaf5] px-1.5 py-0.5 rounded-[3px] shrink-0">
                                Correct Answer
                              </span>
                            )}
                            {isSelected && !isCorrectOption && (
                              <span className="text-[10px] font-mono font-bold uppercase bg-[#cb5521] text-[#fcfaf5] px-1.5 py-0.5 rounded-[3px] shrink-0">
                                Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
