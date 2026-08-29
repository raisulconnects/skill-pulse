"use client";

import React, { useState, useEffect } from "react";
import { X, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";

const EMPTY_QUESTION = {
  question_text: "",
  options: ["", "", "", ""],
  correct_option: "",
};

export default function QuestionModal({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  initialData = null, // null = create mode, object = edit mode
}) {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState(EMPTY_QUESTION);
  const [errors, setErrors] = useState({});

  // Reset/populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          question_text: initialData.question_text || "",
          options: Array.isArray(initialData.options) && initialData.options.length === 4
            ? [...initialData.options]
            : ["", "", "", ""],
          correct_option: initialData.correct_option || "",
        });
      } else {
        setFormData(EMPTY_QUESTION);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.question_text.trim()) {
      newErrors.question_text = "Question text is required";
    }

    for (let i = 0; i < 4; i++) {
      if (!formData.options[i] || !formData.options[i].trim()) {
        newErrors[`option_${i}`] = `Option ${i + 1} cannot be empty`;
      }
    }

    if (!formData.correct_option) {
      newErrors.correct_option = "Please select the correct answer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    const oldValue = newOptions[index];
    newOptions[index] = value;

    // If the correct_option was pointing to the old text, reset it
    let newCorrect = formData.correct_option;
    if (newCorrect === oldValue) {
      newCorrect = "";
    }

    setFormData({ ...formData, options: newOptions, correct_option: newCorrect });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`option_${index}`];
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      question_text: formData.question_text.trim(),
      options: formData.options.map((o) => o.trim()),
      correct_option: formData.correct_option,
    });
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a3300]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] max-w-[560px] w-full shadow-[rgba(0,0,0,0.15)_0px_8px_24px] relative max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 p-6 pb-4 border-b border-[#b6b6b6]/30 sticky top-0 bg-[#fcfaf5] z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#ffe95c] border border-[#1a3300]/20 flex items-center justify-center text-[#1a3300]">
              <HelpCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3
                className="text-[17px] font-bold text-[#1a3300] leading-tight"
                style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
              >
                {isEdit ? "Edit Question" : "Add Question"}
              </h3>
              <p className="text-[11px] font-mono text-[#1a3300]/60">
                {isEdit ? "Update question and options" : "Fill in all 4 options and mark the correct one"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-[6px] text-[#1a3300]/60 hover:text-[#1a3300] hover:bg-[#1a3300]/5 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Question Text */}
          <div>
            <label className="block text-[12px] font-mono font-medium text-[#1a3300] uppercase tracking-wider mb-1.5">
              Question Text <span className="text-[#cb5521]">*</span>
            </label>
            <textarea
              value={formData.question_text}
              onChange={(e) => {
                setFormData({ ...formData, question_text: e.target.value });
                setErrors((prev) => { const n = { ...prev }; delete n.question_text; return n; });
              }}
              rows={3}
              placeholder="e.g. What is React?"
              className={`w-full bg-white border rounded-[8px] px-4 py-3 text-[14px] text-[#1a3300] placeholder-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3300]/30 transition-all resize-none ${
                errors.question_text ? "border-[#cb5521]" : "border-[#1a3300]/30"
              }`}
            />
            {errors.question_text && (
              <p className="flex items-center gap-1 mt-1 text-[12px] font-mono text-[#cb5521]">
                <AlertCircle className="w-3 h-3" /> {errors.question_text}
              </p>
            )}
          </div>

          {/* Options */}
          <div>
            <label className="block text-[12px] font-mono font-medium text-[#1a3300] uppercase tracking-wider mb-2">
              Options <span className="text-[#cb5521]">*</span>
              <span className="text-[#1a3300]/50 normal-case ml-1">(all 4 required)</span>
            </label>
            <div className="space-y-2.5">
              {formData.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-[6px] bg-[#1a3300] text-[#fcfaf5] text-[12px] font-mono font-bold flex items-center justify-center shrink-0">
                    {optionLabels[idx]}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${optionLabels[idx]}`}
                    className={`flex-1 bg-white border rounded-[8px] px-3 py-2 text-[14px] text-[#1a3300] placeholder-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3300]/30 transition-all ${
                      errors[`option_${idx}`] ? "border-[#cb5521]" : "border-[#1a3300]/30"
                    }`}
                  />
                </div>
              ))}
              {/* Collective option errors */}
              {["option_0","option_1","option_2","option_3"].some((k) => errors[k]) && (
                <p className="flex items-center gap-1 text-[12px] font-mono text-[#cb5521]">
                  <AlertCircle className="w-3 h-3" /> All 4 options must be filled in
                </p>
              )}
            </div>
          </div>

          {/* Correct Answer Selector */}
          <div>
            <label className="block text-[12px] font-mono font-medium text-[#1a3300] uppercase tracking-wider mb-2">
              Correct Answer <span className="text-[#cb5521]">*</span>
            </label>
            <div className="space-y-2">
              {formData.options.map((opt, idx) => {
                const trimmed = opt.trim();
                const isSelected = formData.correct_option === trimmed && trimmed !== "";
                const disabled = !trimmed;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (!disabled) {
                        setFormData({ ...formData, correct_option: trimmed });
                        setErrors((prev) => { const n = { ...prev }; delete n.correct_option; return n; });
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-[8px] border text-left transition-all ${
                      isSelected
                        ? "bg-[#d5f5c2] border-[#1a3300] shadow-xs"
                        : disabled
                        ? "bg-[#1a3300]/5 border-[#1a3300]/15 opacity-50 cursor-not-allowed"
                        : "bg-white border-[#1a3300]/25 hover:border-[#1a3300] hover:bg-[#1a3300]/3"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "border-[#1a3300] bg-[#1a3300]" : "border-[#1a3300]/40"
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#fcfaf5]" />}
                    </div>
                    <span className="text-[12px] font-mono font-bold text-[#1a3300]/60 shrink-0">
                      {optionLabels[idx]}
                    </span>
                    <span className={`text-[13px] ${isSelected ? "font-medium text-[#1a3300]" : "text-[#1a3300]/80"}`}>
                      {trimmed || <span className="italic text-[#1a3300]/40">Enter option {optionLabels[idx]} above</span>}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1a3300] ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
            {errors.correct_option && (
              <p className="flex items-center gap-1 mt-1.5 text-[12px] font-mono text-[#cb5521]">
                <AlertCircle className="w-3 h-3" /> {errors.correct_option}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#b6b6b6]/30">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-[6px] text-[13px] font-medium text-[#1a3300] bg-[#1a3300]/5 border border-[#1a3300]/20 hover:bg-[#1a3300]/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-[6px] text-[13px] font-medium text-[#fcfaf5] bg-[#1a3300] border border-[#1a3300] hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#fcfaf5] border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? "Save Changes" : "Add Question"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
