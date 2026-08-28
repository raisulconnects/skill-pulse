"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  AtSign,
  ShieldCheck,
} from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";

function RegisterContent() {
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role");

  // Step 1: Role Selection | Step 2: Account Details
  const [step, setStep] = useState(
    initialRoleParam === "student" || initialRoleParam === "instructor" ? 2 : 1
  );

  const [formData, setFormData] = useState({
    role: initialRoleParam === "instructor" ? "instructor" : "student",
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    setStep(2);
    setErrorMessage("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.username.trim() || !formData.email.trim()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    if (!formData.agreeToTerms) {
      setErrorMessage("Please accept the Terms of Service to continue.");
      return;
    }

    setIsLoading(true);
    // UI placeholder for account creation
    setTimeout(() => {
      setIsLoading(false);
      alert(
        `[Frontend Mock] Registered successfully as [${formData.role.toUpperCase()}]:\nName: ${formData.fullName}\nUsername: ${formData.username}\nEmail: ${formData.email}`
      );
    }, 800);
  };

  return (
    <AuthLayout
      badge={step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
      title={
        step === 1 ? (
          <>
            Choose your <span className="marker-highlight">learning path</span>
          </>
        ) : (
          <>
            Create your <span className="marker-highlight">account</span>
          </>
        )
      }
      subtitle={
        step === 1
          ? "Select how you would like to use SkillPulse. We'll tailor your experience accordingly."
          : `Joining SkillPulse as a ${formData.role === "student" ? "Student" : "Course Instructor"}.`
      }
    >
      {/* STEP 1: MODERN ROLE SELECTION */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Student Role Card */}
            <div
              onClick={() => handleRoleSelect("student")}
              className="bg-[#d5f5c2] border-2 border-[#1a3300] rounded-[14px] p-6 sm:p-7 cursor-pointer sticky-card shadow-[rgba(0,0,0,0.05)_0px_2px_6px] flex flex-col justify-between group hover:shadow-[rgba(0,0,0,0.09)_0px_4px_12px] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono font-bold bg-[#1a3300] text-[#fcfaf5] px-2.5 py-1 rounded-[4px]">
                    01 / STUDENT
                  </span>
                  <div className="w-10 h-10 rounded-[8px] bg-[#1a3300]/10 flex items-center justify-center text-[#1a3300] group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-[22px] font-bold text-[#1a3300] mb-2 tracking-tight">
                  I want to Learn
                </h3>
                <p className="text-[14px] text-[#1a3300]/85 leading-relaxed mb-6">
                  Learn new tech skills through structured courses, interactive quizzes, and skill roadmaps.
                </p>

                <ul className="space-y-2 text-[13px] text-[#1a3300]/90 mb-6 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                    <span>Explore 120+ courses & tracks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                    <span>Track lesson & quiz progress</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                    <span>Earn verified skill certificates</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] text-[14px] font-medium py-3 rounded-[6px] group-hover:bg-[#1a3300]/90 transition-colors"
              >
                <span>Continue as Student</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Instructor Role Card */}
            <div
              onClick={() => handleRoleSelect("instructor")}
              className="bg-[#ffe95c] border-2 border-[#1a3300] rounded-[14px] p-6 sm:p-7 cursor-pointer sticky-card shadow-[rgba(0,0,0,0.05)_0px_2px_6px] flex flex-col justify-between group hover:shadow-[rgba(0,0,0,0.09)_0px_4px_12px] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono font-bold bg-[#1a3300] text-[#fcfaf5] px-2.5 py-1 rounded-[4px]">
                    02 / INSTRUCTOR
                  </span>
                  <div className="w-10 h-10 rounded-[8px] bg-[#1a3300]/10 flex items-center justify-center text-[#1a3300] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-[22px] font-bold text-[#1a3300] mb-2 tracking-tight">
                  I want to Teach
                </h3>
                <p className="text-[14px] text-[#1a3300]/85 leading-relaxed mb-6">
                  Share your expertise, author rich curricula, create interactive quizzes, and mentor developers.
                </p>

                <ul className="space-y-2 text-[13px] text-[#1a3300]/90 mb-6 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                    <span>Author & publish courses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                    <span>Create coding quizzes & milestones</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
                    <span>Manage students & reviews</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] text-[14px] font-medium py-3 rounded-[6px] group-hover:bg-[#1a3300]/90 transition-colors"
              >
                <span>Continue as Instructor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Already have an account */}
          <div className="text-center text-[14px] text-[#1a3300]/80 pt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#1a3300] underline decoration-[#ffe95c] decoration-4 underline-offset-4 hover:decoration-[#1a3300] transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* STEP 2: REGISTRATION FORM */}
      {step === 2 && (
        <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.06)_0px_4px_12px]">
          {/* Selected Role Ribbon / Switcher */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#b6b6b6]/40">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono text-[#1a3300]/70">Selected role:</span>
              <span
                className={`text-[12px] font-mono font-bold px-2.5 py-0.5 rounded-[4px] border border-[#1a3300]/20 ${
                  formData.role === "student"
                    ? "bg-[#d5f5c2] text-[#1a3300]"
                    : "bg-[#ffe95c] text-[#1a3300]"
                }`}
              >
                {formData.role === "student" ? "🎓 Student" : "✨ Instructor"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-[12px] font-mono text-[#1a3300]/80 hover:text-[#1a3300] underline underline-offset-2"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Change path</span>
            </button>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] flex items-center gap-2.5 text-[14px] text-[#1a3300] font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-[#cb5521] shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-[13px] font-mono font-semibold uppercase tracking-wider text-[#1a3300] mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full bg-[#fcfaf5] border border-[#1a3300] rounded-[6px] px-4 py-2.5 text-[15px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#ffe95c] focus:border-[#1a3300] transition-all"
                />
                <User className="w-4 h-4 text-[#1a3300]/40 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-[13px] font-mono font-semibold uppercase tracking-wider text-[#1a3300] mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. alex_dev"
                  required
                  className="w-full bg-[#fcfaf5] border border-[#1a3300] rounded-[6px] px-4 py-2.5 text-[15px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#ffe95c] focus:border-[#1a3300] transition-all"
                />
                <AtSign className="w-4 h-4 text-[#1a3300]/40 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-[13px] font-mono font-semibold uppercase tracking-wider text-[#1a3300] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@company.com"
                  required
                  className="w-full bg-[#fcfaf5] border border-[#1a3300] rounded-[6px] px-4 py-2.5 text-[15px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#ffe95c] focus:border-[#1a3300] transition-all"
                />
                <Mail className="w-4 h-4 text-[#1a3300]/40 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-mono font-semibold uppercase tracking-wider text-[#1a3300] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  className="w-full bg-[#fcfaf5] border border-[#1a3300] rounded-[6px] px-4 py-2.5 text-[15px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#ffe95c] focus:border-[#1a3300] transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-[#1a3300]/60 hover:text-[#1a3300] rounded transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[13px] font-mono font-semibold uppercase tracking-wider text-[#1a3300] mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  className="w-full bg-[#fcfaf5] border border-[#1a3300] rounded-[6px] px-4 py-2.5 text-[15px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#ffe95c] focus:border-[#1a3300] transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 p-1 text-[#1a3300]/60 hover:text-[#1a3300] rounded transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 rounded-[4px] border-[#1a3300] text-[#1a3300] accent-[#1a3300] focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                />
                <span className="text-[13px] text-[#1a3300]/85 leading-snug">
                  I agree to the{" "}
                  <Link href="/terms" className="underline font-semibold text-[#1a3300]">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline font-semibold text-[#1a3300]">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] text-[15px] font-medium py-3.5 px-6 rounded-[6px] hover:bg-[#1a3300]/90 transition-transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] mt-2"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#fcfaf5] border-t-transparent rounded-full animate-spin" />
                  <span>Creating {formData.role === "student" ? "Student" : "Instructor"} Account...</span>
                </span>
              ) : (
                <>
                  <span>
                    Create {formData.role === "student" ? "Student" : "Instructor"} Account
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link back to login */}
          <div className="mt-6 text-center text-[14px] text-[#1a3300]/80">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-bold text-[#1a3300] underline decoration-[#ffe95c] decoration-4 underline-offset-4 hover:decoration-[#1a3300] transition-all"
            >
              Sign in to account
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfaf5] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#1a3300] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
