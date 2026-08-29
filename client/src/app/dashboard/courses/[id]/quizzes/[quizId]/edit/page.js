"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import QuizForm from "@/components/quizzes/QuizForm";
import QuestionModal from "@/components/quizzes/QuestionModal";
import DeleteQuizModal from "@/components/quizzes/DeleteQuizModal";
import {
  ArrowLeft,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

const MAX_QUESTIONS = 10;

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const courseId = params?.id;
  const quizId = params?.quizId;
  const userRole = user?.user_role || "student";

  const [quiz, setQuiz] = useState(null);
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Quiz edit state
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizSaveSuccess, setQuizSaveSuccess] = useState(false);

  // Question modal state
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // null = new, object = edit
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState("");

  // Delete question state
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  // Delete quiz state
  const [deleteQuizOpen, setDeleteQuizOpen] = useState(false);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);

  const loadQuiz = useCallback(async () => {
    if (!quizId) return;
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      const data = await res.json();
      if (res.ok && data.data) {
        const quizData = data.data;
        setQuiz(quizData);
        setQuestions(
          Array.isArray(quizData.questions)
            ? [...quizData.questions].sort((a, b) => (a.id || 0) - (b.id || 0))
            : []
        );
      } else {
        setError(data.error?.message || data.error || "Quiz not found.");
      }
    } catch {
      setError("Failed to load quiz.");
    }
  }, [quizId]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole === "student") {
      router.replace("/dashboard");
      return;
    }

    async function initLoad() {
      setLoading(true);
      try {
        // Load course
        const cRes = await fetch(`/api/courses/${courseId}`);
        const cData = await cRes.json();
        if (cRes.ok && cData.data) {
          setCourse(cData.data);
        }
        // Load quiz
        await loadQuiz();
      } finally {
        setLoading(false);
      }
    }

    initLoad();
  }, [authLoading, user, courseId, quizId]);

  // --- Quiz Edit ---
  const handleQuizSubmit = async ({ title }) => {
    setIsSubmittingQuiz(true);
    setError("");
    setQuizSaveSuccess(false);

    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { title } }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setQuiz(data.data);
        setQuizSaveSuccess(true);
        setTimeout(() => setQuizSaveSuccess(false), 3000);
      } else {
        setError(data.error?.message || data.error || "Failed to update quiz.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // --- Delete Quiz ---
  const handleDeleteQuiz = async () => {
    setIsDeletingQuiz(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
      if (res.ok) {
        router.push(`/dashboard/courses/${courseId}`);
      } else {
        const data = await res.json();
        alert(data.error?.message || data.error || "Failed to delete quiz.");
        setIsDeletingQuiz(false);
      }
    } catch {
      alert("An error occurred while deleting the quiz.");
      setIsDeletingQuiz(false);
    }
    setDeleteQuizOpen(false);
  };

  // --- Add Question ---
  const handleOpenAddQuestion = () => {
    if (questions.length >= MAX_QUESTIONS) return;
    setEditingQuestion(null);
    setQuestionError("");
    setQuestionModalOpen(true);
  };

  // --- Edit Question ---
  const handleOpenEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionError("");
    setQuestionModalOpen(true);
  };

  // --- Save Question (create or update) ---
  const handleSaveQuestion = async ({ question_text, options, correct_option }) => {
    setIsSavingQuestion(true);
    setQuestionError("");

    const isEditMode = !!editingQuestion;

    try {
      let res;
      if (isEditMode) {
        const qId = editingQuestion.documentId || editingQuestion.id;
        res = await fetch(`/api/questions/${qId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { question_text, options, correct_option } }),
        });
      } else {
        res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              question_text,
              options,
              correct_option,
              quiz: quizId,
            },
          }),
        });
      }

      const data = await res.json();

      if (res.ok) {
        setQuestionModalOpen(false);
        await loadQuiz();
      } else {
        setQuestionError(data.error?.message || data.error || "Failed to save question.");
      }
    } catch {
      setQuestionError("An unexpected error occurred.");
    } finally {
      setIsSavingQuestion(false);
    }
  };

  // --- Delete Question ---
  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    setIsDeletingQuestion(true);

    const qId = questionToDelete.documentId || questionToDelete.id;

    try {
      const res = await fetch(`/api/questions/${qId}`, { method: "DELETE" });
      if (res.ok) {
        await loadQuiz();
        setQuestionToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error?.message || data.error || "Failed to delete question.");
      }
    } catch {
      alert("An error occurred while deleting the question.");
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  const optionLabels = ["A", "B", "C", "D"];
  const atMaxQuestions = questions.length >= MAX_QUESTIONS;

  return (
    <DashboardShell userRole={userRole}>
      <div className="max-w-[900px] animate-in fade-in duration-200">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {course?.title || "Course"}</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading quiz...</p>
          </div>
        ) : error && !quiz ? (
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-4 text-[#cb5521] text-[14px]">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Global error */}
            {error && (
              <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-3 text-[#cb5521] text-[13px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Quiz save success */}
            {quizSaveSuccess && (
              <div className="bg-[#d5f5c2] border border-[#1a3300]/20 rounded-[8px] p-3 text-[#1a3300] text-[13px] font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                Quiz updated successfully!
              </div>
            )}

            {/* Quiz Edit Form */}
            <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#b6b6b6]/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[8px] bg-[#ffe95c] border border-[#1a3300]/20 flex items-center justify-center text-[#1a3300]">
                    <HelpCircle className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2
                      className="text-[18px] font-bold text-[#1a3300]"
                      style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                    >
                      Quiz Settings
                    </h2>
                    <p className="text-[11px] font-mono text-[#1a3300]/60">
                      Course: {course?.title || courseId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteQuizOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#cb5521] border border-[#cb5521]/30 hover:bg-[#cb5521]/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Quiz</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-mono font-medium text-[#1a3300] uppercase tracking-wider mb-1.5">
                    Quiz Title <span className="text-[#cb5521]">*</span>
                  </label>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = e.target.querySelector("input[name='title']");
                      if (input?.value.trim()) {
                        handleQuizSubmit({ title: input.value.trim() });
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      name="title"
                      defaultValue={quiz?.title || ""}
                      placeholder="Quiz title"
                      className="flex-1 bg-white border border-[#1a3300]/30 rounded-[8px] px-4 py-2.5 text-[14px] text-[#1a3300] placeholder-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3300]/30 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingQuiz}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-[13px] font-medium text-[#fcfaf5] bg-[#1a3300] hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm disabled:opacity-50"
                    >
                      {isSubmittingQuiz ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#fcfaf5] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Questions Management */}
            <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#b6b6b6]/30">
                <div>
                  <h3
                    className="text-[18px] font-bold text-[#1a3300]"
                    style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                  >
                    Questions
                  </h3>
                  <p className="text-[12px] font-mono text-[#1a3300]/60">
                    {questions.length} of {MAX_QUESTIONS} questions added
                  </p>
                </div>

                <button
                  onClick={handleOpenAddQuestion}
                  disabled={atMaxQuestions}
                  title={atMaxQuestions ? `Maximum ${MAX_QUESTIONS} questions reached` : "Add a new question"}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-all self-start sm:self-auto ${
                    atMaxQuestions
                      ? "bg-[#1a3300]/10 text-[#1a3300]/40 border border-[#1a3300]/15 cursor-not-allowed"
                      : "bg-[#1a3300] text-[#fcfaf5] hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
                  }`}
                >
                  <PlusCircle className={`w-3.5 h-3.5 ${atMaxQuestions ? "" : "text-[#ffe95c]"}`} />
                  <span>Add Question</span>
                </button>
              </div>

              {atMaxQuestions && (
                <div className="bg-[#ffe95c]/30 border border-[#1a3300]/20 rounded-[8px] p-3 mb-4 flex items-center gap-2 text-[13px] font-mono text-[#1a3300]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Maximum of {MAX_QUESTIONS} questions reached. Remove a question to add a new one.
                </div>
              )}

              {/* Question error */}
              {questionError && (
                <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-3 mb-4 text-[#cb5521] text-[13px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {questionError}
                </div>
              )}

              {questions.length === 0 ? (
                <div className="p-8 text-center bg-[#1a3300]/5 rounded-[8px] border border-dashed border-[#1a3300]/20">
                  <HelpCircle className="w-8 h-8 text-[#1a3300]/40 mx-auto mb-2" />
                  <p className="text-[14px] text-[#1a3300]/70 font-medium">No questions added yet</p>
                  <p className="text-[12px] font-mono text-[#1a3300]/50 mt-1">
                    Click &ldquo;Add Question&rdquo; above to add the first question.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const qOptions = Array.isArray(q.options) ? q.options : [];
                    return (
                      <div
                        key={q.documentId || q.id}
                        className="bg-[#fcfaf5] border border-[#1a3300]/20 rounded-[10px] p-4 hover:border-[#1a3300]/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Question number badge */}
                            <span className="w-7 h-7 rounded-[6px] bg-[#1a3300] text-[#fcfaf5] text-[12px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[14px] text-[#1a3300] mb-2 leading-snug">
                                {q.question_text}
                              </p>

                              {/* Options grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {qOptions.map((opt, oIdx) => {
                                  const isCorrect = opt === q.correct_option;
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`flex items-center gap-2 text-[12px] px-2.5 py-1.5 rounded-[6px] border ${
                                        isCorrect
                                          ? "bg-[#d5f5c2] border-[#1a3300]/25 text-[#1a3300] font-medium"
                                          : "bg-[#1a3300]/5 border-[#1a3300]/15 text-[#1a3300]/70"
                                      }`}
                                    >
                                      <span className="font-mono font-bold text-[11px] text-[#1a3300]/50">
                                        {optionLabels[oIdx]}
                                      </span>
                                      <span className="flex-1 truncate">{opt}</span>
                                      {isCorrect && (
                                        <CheckCircle2 className="w-3 h-3 text-[#1a3300] shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleOpenEditQuestion(q)}
                              className="p-1.5 text-[#1a3300]/70 hover:text-[#1a3300] hover:bg-[#1a3300]/10 rounded-[4px] transition-colors"
                              title="Edit Question"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setQuestionToDelete(q)}
                              className="p-1.5 text-[#cb5521]/80 hover:text-[#cb5521] hover:bg-[#cb5521]/10 rounded-[4px] transition-colors"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Question Modal */}
      <QuestionModal
        isOpen={questionModalOpen}
        onClose={() => {
          setQuestionModalOpen(false);
          setQuestionError("");
        }}
        onSave={handleSaveQuestion}
        isSaving={isSavingQuestion}
        initialData={editingQuestion}
      />

      {/* Delete Question Confirmation (inline) */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a3300]/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] max-w-[440px] w-full p-6 shadow-[rgba(0,0,0,0.15)_0px_8px_24px] relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#fcd0d0] border border-[#cb5521] flex items-center justify-center text-[#cb5521] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className="text-[17px] font-bold text-[#1a3300]"
                  style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                >
                  Delete Question
                </h3>
                <p className="text-[12px] font-mono text-[#1a3300]/60">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-[14px] text-[#1a3300]/80 mb-5 leading-relaxed">
              Are you sure you want to delete this question? <strong className="text-[#1a3300]">&ldquo;{questionToDelete.question_text}&rdquo;</strong>
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#b6b6b6]/30">
              <button
                onClick={() => setQuestionToDelete(null)}
                disabled={isDeletingQuestion}
                className="px-4 py-2 rounded-[6px] text-[13px] font-medium text-[#1a3300] bg-[#1a3300]/5 border border-[#1a3300]/20 hover:bg-[#1a3300]/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuestion}
                disabled={isDeletingQuestion}
                className="px-4 py-2 rounded-[6px] text-[13px] font-medium text-[#fcfaf5] bg-[#cb5521] hover:bg-[#cb5521]/90 transition-transform active:scale-[0.98] shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingQuestion ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#fcfaf5] border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Question</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quiz Modal */}
      <DeleteQuizModal
        isOpen={deleteQuizOpen}
        quizTitle={quiz?.title || ""}
        onConfirm={handleDeleteQuiz}
        onClose={() => setDeleteQuizOpen(false)}
        isDeleting={isDeletingQuiz}
      />
    </DashboardShell>
  );
}
