"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertCircle, Mail } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.identifier.trim() || !formData.password.trim()) {
      setErrorMessage("Please enter both your email/username and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await login(formData.identifier, formData.password);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setErrorMessage(result.error || "Invalid credentials. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badge="Welcome Back"
      title={
        <>
          Sign in to <span className="marker-highlight">SkillPulse</span>
        </>
      }
      subtitle="Continue your learning journey, track your progress, and tackle new quizzes."
    >
      <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.06)_0px_4px_12px]">
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] flex items-center gap-2.5 text-[14px] text-[#1a3300] font-medium animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-[#cb5521] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier field (Email or Username) */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-[13px] font-mono font-semibold uppercase tracking-wider text-[#1a3300] mb-2"
            >
              Email or Username
            </label>
            <div className="relative">
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="alex@example.com or alex_dev"
                autoComplete="username"
                required
                disabled={isSubmitting}
                className="w-full bg-[#fcfaf5] border border-[#1a3300] rounded-[6px] px-4 py-3 text-[15px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#ffe95c] focus:border-[#1a3300] transition-all disabled:opacity-60"
              />
              <Mail className="w-4 h-4 text-[#1a3300]/40 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-[13px] font-mono font-semibold uppercase tracking-wider text-[#1a3300]"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[12px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] underline underline-offset-2 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                className="w-full bg-[#fcfaf5] border border-[#1a3300] rounded-[6px] px-4 py-3 text-[15px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#ffe95c] focus:border-[#1a3300] transition-all pr-11 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 text-[#1a3300]/60 hover:text-[#1a3300] rounded transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-4 h-4 rounded-[4px] border-[#1a3300] text-[#1a3300] accent-[#1a3300] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-[13px] font-mono text-[#1a3300]/80">
                Remember me on this device
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] text-[15px] font-medium py-3.5 px-6 rounded-[6px] hover:bg-[#1a3300]/90 transition-transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px]"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#fcfaf5] border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Fill Helper */}
        <div className="mt-6 pt-5 border-t border-[#b6b6b6]/40 flex items-center justify-between text-[12px] font-mono text-[#1a3300]/70">
          <span>Quick fill test:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  identifier: "johndoe",
                  password: "password123",
                  rememberMe: true,
                })
              }
              className="bg-[#d5f5c2] border border-[#1a3300]/20 px-2 py-0.5 rounded-[4px] text-[#1a3300] font-semibold hover:bg-[#d5f5c2]/80"
            >
              Demo User
            </button>
          </div>
        </div>

        {/* Link to Registration */}
        <div className="mt-6 text-center text-[14px] text-[#1a3300]/80">
          Don't have an account yet?{" "}
          <Link
            href="/register"
            className="font-bold text-[#1a3300] underline decoration-[#ffe95c] decoration-4 underline-offset-4 hover:decoration-[#1a3300] transition-all"
          >
            Create an account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
