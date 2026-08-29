"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Trophy,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
} from "lucide-react";

export default function StudentTakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const courseId = params?.id;
  const quizId = params?.quizId;
  const userRole = user?.user_role || "student";

  // Data states
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Quiz progress states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: "Selected option string" }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null); // Result payload returned from server

  // Fetch student-sanitized quiz data (no correct_option exposed)
  const fetchQuiz = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/quizzes/${quizId}/take`);
      const data = await res.json();

      if (res.ok && data.data) {
        setQuizData(data.data);
      } else {
        setError(data.error?.message || data.error || "Failed to load quiz.");
      }
    } catch (err) {
      console.error("Error loading quiz for student:", err);
      setError("An unexpected error occurred while loading the quiz.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "student") {
      router.replace("/dashboard");
      return;
    }

    if (quizId) {
      fetchQuiz();
    }
  }, [authLoading, user, quizId, userRole]);

  // Handle option click for current question
  const handleSelectOption = (questionId, optionText) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  // Submit quiz handler
  const handleSubmitQuiz = async () => {
    if (!quizData || !quizData.questions) return;

    const questions = quizData.questions;
    // Format answers array
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      answer: selectedAnswers[q.id] || "",
    }));

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            answers: formattedAnswers,
          },
        }),
      });

      const data = await res.json();

      if (res.ok && data.data) {
        setResult(data.data);
      } else {
        setError(data.error?.message || data.error || "Failed to submit quiz.");
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("An error occurred while submitting your answers.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setResult(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    fetchQuiz();
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <DashboardShell userRole="student">
      <div className="max-w-[800px] animate-in fade-in duration-200">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
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
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading quiz questions...</p>
          </div>
        ) : error && !quizData ? (
          <div className="bg-[#fcd0d0] border-2 border-[#cb5521] rounded-[12px] p-6 text-center text-[#cb5521]">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold text-[18px] mb-1">Quiz Unavailable</h3>
            <p className="text-[14px] mb-4">{error}</p>
            <Link
              href={`/dashboard/courses/${courseId}`}
              className="inline-block bg-[#1a3300] text-[#fcfaf5] px-4 py-2 rounded-[6px] text-[13px] font-medium"
            >
              Return to Course Page
            </Link>
          </div>
        ) : result ? (
          /* ========================================================================= */
          /* RESULT STATE VIEW (IMMEDIATE SCORE RESULT)                              */
          /* ========================================================================= */
          <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-8 shadow-[rgba(0,0,0,0.06)_0px_8px_24px] space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ffe95c] border-2 border-[#1a3300] flex items-center justify-center mx-auto text-[#1a3300] shadow-sm">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#d5f5c2] border border-[#1a3300]/20 px-3 py-1 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Assessment Complete
              </span>
              <h2
                className="text-[28px] sm:text-[34px] font-[800] text-[#1a3300] leading-tight mb-1"
                style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
              >
                {quizData?.title}
              </h2>
              <p className="text-[14px] text-[#1a3300]/70">
                Your submission has been evaluated by SkillPulse.
              </p>
            </div>

            {/* Score Display Card */}
            <div className="bg-[#1a3300]/5 border border-[#1a3300]/20 rounded-[14px] p-6 max-w-[400px] mx-auto space-y-3">
              <span className="text-[12px] font-mono text-[#1a3300]/60 uppercase tracking-wider block">
                Your Final Score
              </span>
              <div
                className="text-[44px] font-[800] text-[#1a3300] leading-none"
                style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
              >
                {result.score} <span className="text-[24px] text-[#1a3300]/60">/ {result.total_questions}</span>
              </div>
              <div className="inline-block bg-[#ffe95c] text-[#1a3300] border border-[#1a3300]/30 text-[14px] font-mono font-bold px-3 py-1 rounded-[6px]">
                {result.percentage}% Score
              </div>
            </div>

            {/* Result Stats Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-[400px] mx-auto pt-2">
              <div className="bg-white border border-[#1a3300]/20 rounded-[10px] p-3 text-center">
                <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase block">Correct Answers</span>
                <span className="text-[18px] font-bold text-[#1a3300]">{result.score}</span>
              </div>
              <div className="bg-white border border-[#1a3300]/20 rounded-[10px] p-3 text-center">
                <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase block">Total Questions</span>
                <span className="text-[18px] font-bold text-[#1a3300]">{result.total_questions}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[#b6b6b6]/30">
              <button
                onClick={handleRetakeQuiz}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1a3300]/5 text-[#1a3300] border border-[#1a3300]/25 px-5 py-2.5 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
              <Link
                href={`/dashboard/courses/${courseId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-6 py-2.5 rounded-[6px] text-[13px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-[#ffe95c]" />
                <span>Return to Course</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* ACTIVE QUIZ TAKING QUESTION VIEW                                         */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase block">
                    {quizData?.course?.title}
                  </span>
                  <h1
                    className="text-[20px] sm:text-[24px] font-bold text-[#1a3300] leading-snug"
                    style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                  >
                    {quizData?.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2 bg-[#1a3300]/5 border border-[#1a3300]/20 px-3 py-1.5 rounded-[6px] font-mono text-[12px] text-[#1a3300]">
                  <HelpCircle className="w-4 h-4 text-[#1a3300]" />
                  <span>
                    Question <strong>{currentIndex + 1}</strong> of <strong>{quizData?.total_questions}</strong>
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#1a3300]/10 rounded-full overflow-hidden border border-[#1a3300]/15">
                <div
                  className="h-full bg-[#1a3300] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(((currentIndex + 1) / (quizData?.total_questions || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-3 text-[#cb5521] text-[13px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Current Question Card */}
            {quizData?.questions && quizData.questions[currentIndex] && (
              <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.05)_0px_4px_12px] space-y-6">
                {/* Question Header */}
                <div className="space-y-2">
                  <span className="text-[12px] font-mono font-bold text-[#1a3300]/60 uppercase tracking-wider block">
                    Question {currentIndex + 1}
                  </span>
                  <h3
                    className="text-[18px] sm:text-[22px] font-bold text-[#1a3300] leading-snug"
                    style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                  >
                    {quizData.questions[currentIndex].question_text}
                  </h3>
                </div>

                {/* 4 Selectable Options */}
                <div className="space-y-3 pt-2">
                  {quizData.questions[currentIndex].options.map((optionText, optIdx) => {
                    const qId = quizData.questions[currentIndex].id;
                    const isSelected = selectedAnswers[qId] === optionText;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(qId, optionText)}
                        className={`w-full flex items-center gap-3.5 p-4 rounded-[10px] border-2 text-left transition-all group ${
                          isSelected
                            ? "bg-[#ffe95c]/30 border-[#1a3300] shadow-xs"
                            : "bg-white border-[#1a3300]/20 hover:border-[#1a3300] hover:bg-[#1a3300]/3"
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-[6px] font-mono text-[13px] font-bold flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-[#1a3300] text-[#fcfaf5]"
                              : "bg-[#1a3300]/10 text-[#1a3300] group-hover:bg-[#1a3300]/20"
                          }`}
                        >
                          {optionLabels[optIdx]}
                        </span>
                        <span className={`text-[15px] flex-1 leading-snug ${isSelected ? "font-bold text-[#1a3300]" : "text-[#1a3300]/85"}`}>
                          {optionText}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#1a3300] flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#ffe95c]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between gap-4 pt-6 border-t border-[#b6b6b6]/30">
                  <button
                    type="button"
                    disabled={currentIndex === 0 || isSubmitting}
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[6px] text-[13px] font-medium text-[#1a3300] bg-[#1a3300]/5 border border-[#1a3300]/20 hover:bg-[#1a3300]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentIndex < quizData.questions.length - 1 ? (
                    <button
                      type="button"
                      disabled={!selectedAnswers[quizData.questions[currentIndex].id]}
                      onClick={() => setCurrentIndex((prev) => prev + 1)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[6px] text-[13px] font-medium text-[#fcfaf5] bg-[#1a3300] hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4 text-[#ffe95c]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!selectedAnswers[quizData.questions[currentIndex].id] || isSubmitting}
                      onClick={handleSubmitQuiz}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[6px] text-[14px] font-bold text-[#1a3300] bg-[#ffe95c] border border-[#1a3300]/30 hover:bg-[#ffe95c]/80 transition-transform active:scale-[0.98] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#1a3300] border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Quiz</span>
                          <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
