"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, Sparkles, RefreshCw } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

export default function QuizPreview() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sampleQuestion = {
    category: "Next.js & React 19",
    difficulty: "Intermediate",
    prompt: "In Next.js App Router, which directive marks a file so it runs exclusively on the client-side with full access to React state & browser APIs?",
    options: [
      { id: "a", text: '"use client"', isCorrect: true, explanation: "Correct! The 'use client' directive marks the boundary between React Server Components and Client Components." },
      { id: "b", text: '"use server"', isCorrect: false, explanation: "Incorrect. 'use server' designates Server Actions that execute on the server." },
      { id: "c", text: '"client only"', isCorrect: false, explanation: "Incorrect. 'client-only' is a utility package, not a top-level directive." },
      { id: "d", text: '"use browser"', isCorrect: false, explanation: "Incorrect. 'use browser' is not a standard React or Next.js directive." },
    ],
  };

  const handleSelect = (optionId) => {
    if (isSubmitted) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const chosenObj = sampleQuestion.options.find((o) => o.id === selectedOption);

  return (
    <section id="quizzes" className="py-16 md:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <FadeIn direction="up">
        <div className="bg-[#a8e5e5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-10 lg:p-12 shadow-[rgba(0,0,0,0.06)_0px_4px_12px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Context */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-3 py-1 rounded-[4px] text-[11px] font-mono font-medium mb-4 animate-float">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffe95c] animate-pulse-subtle" />
                  <span>INTERACTIVE QUIZ ENGINE</span>
                </div>
                <h2
                  className="text-[30px] sm:text-[40px] font-[800] text-[#1a3300] leading-tight tracking-[0.03em] mb-4"
                  style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                >
                  Validate skills with <span className="bg-[#ffe95c] px-2 py-0.5 rounded-[4px]">real questions</span>.
                </h2>
                <p className="text-[16px] text-[#1a3300]/85 leading-relaxed mb-6">
                  Every lesson in SkillPulse is backed by real-world coding drills, multiple-choice diagnostics, and timed milestone quizzes.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#1a3300]/20 text-[14px] font-medium text-[#1a3300]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                  <span>Over 2,400+ vetted quiz questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                  <span>Automated instant solution explanations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                  <span>Track mastery level & weak points</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Quiz Card */}
            <div className="lg:col-span-7 bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[12px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.05)_0px_2px_6px]">
              {/* Quiz Card Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#b6b6b6]/40">
                <span className="text-[11px] font-mono font-bold bg-[#ffe95c] text-[#1a3300] px-2.5 py-0.5 rounded-[4px] border border-[#1a3300]/20">
                  {sampleQuestion.category}
                </span>
                <span className="text-[11px] font-mono text-[#1a3300]/60">
                  Difficulty: {sampleQuestion.difficulty}
                </span>
              </div>

              {/* Question prompt */}
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#1a3300] mb-5 leading-snug">
                {sampleQuestion.prompt}
              </h3>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {sampleQuestion.options.map((option) => {
                  const isChosen = selectedOption === option.id;
                  let optionStyle = "bg-[#fcfaf5] border-[#b6b6b6] text-[#1a3300] hover:border-[#1a3300]";

                  if (isChosen && !isSubmitted) {
                    optionStyle = "bg-[#ffe95c]/30 border-[#1a3300] text-[#1a3300] font-semibold";
                  } else if (isSubmitted) {
                    if (option.isCorrect) {
                      optionStyle = "bg-[#d5f5c2] border-[#1a3300] text-[#1a3300] font-semibold";
                    } else if (isChosen && !option.isCorrect) {
                      optionStyle = "bg-[#fcd0d0] border-[#1a3300] text-[#1a3300]";
                    } else {
                      optionStyle = "bg-[#fcfaf5] border-[#b6b6b6]/50 text-[#1a3300]/50";
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option.id)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-3.5 rounded-[6px] border text-[14px] flex items-center justify-between transition-all btn-interactive ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-[4px] bg-[#1a3300]/10 font-mono text-[12px] flex items-center justify-center font-bold">
                          {option.id.toUpperCase()}
                        </span>
                        <span className="font-mono">{option.text}</span>
                      </div>
                      {isSubmitted && option.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-[#1a3300]" />
                      )}
                      {isSubmitted && isChosen && !option.isCorrect && (
                        <XCircle className="w-5 h-5 text-[#cb5521]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation box after submit */}
              {isSubmitted && chosenObj && (
                <div
                  className={`p-4 rounded-[6px] mb-5 text-[13px] border animate-scale-in ${
                    chosenObj.isCorrect
                      ? "bg-[#d5f5c2]/60 border-[#1a3300]/30 text-[#1a3300]"
                      : "bg-[#ffe95c]/40 border-[#1a3300]/30 text-[#1a3300]"
                  }`}
                >
                  <span className="font-bold block mb-1">
                    {chosenObj.isCorrect ? "🎉 Great job!" : "💡 Explanation:"}
                  </span>
                  <p>{chosenObj.explanation}</p>
                </div>
              )}

              {/* Quiz Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#b6b6b6]/30">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] hover:scale-105 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Question</span>
                </button>

                {!isSubmitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className={`btn-interactive px-5 py-2 rounded-[6px] text-[14px] font-medium transition-all ${
                      selectedOption
                        ? "bg-[#1a3300] text-[#fcfaf5] hover:bg-[#1a3300]/95 shadow-sm"
                        : "bg-[#b6b6b6]/40 text-[#1a3300]/50 cursor-not-allowed"
                    }`}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <Link
                    href="/dashboard/courses"
                    className="btn-interactive inline-flex items-center gap-1.5 bg-[#1a3300] text-[#fcfaf5] text-[14px] font-medium px-5 py-2 rounded-[6px] hover:bg-[#1a3300]/95 group"
                  >
                    <span>Browse All Courses</span>
                    <ArrowRight className="w-4 h-4 text-[#ffe95c] group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
