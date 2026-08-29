"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import BlogForm from "@/components/blog/BlogForm";
import { PlusCircle, ArrowLeft, ShieldAlert } from "lucide-react";

export default function CreateBlogPostPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userRole = user?.user_role || "student";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user || (userRole !== "admin" && userRole !== "content_manager")) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, userRole, router]);

  if (!authLoading && userRole !== "admin" && userRole !== "content_manager") {
    return (
      <DashboardShell userRole={userRole}>
        <div className="p-8 text-center bg-[#fcd0d0]/40 border-2 border-[#cb5521] rounded-[16px] max-w-[500px] mx-auto mt-12 text-[#1a3300]">
          <ShieldAlert className="w-10 h-10 text-[#cb5521] mx-auto mb-3" />
          <h2 className="text-[20px] font-bold mb-2">Access Denied</h2>
          <p className="text-[14px] text-[#1a3300]/80 mb-4">
            Only Administrators and Content Managers can create blog posts.
          </p>
          <Link href="/dashboard" className="bg-[#1a3300] text-[#fcfaf5] px-5 py-2 rounded-[6px] text-[13px] font-medium">
            Return to Dashboard
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard/blog");
      } else {
        setError(data.error?.message || data.error || "Failed to create blog post.");
      }
    } catch (err) {
      console.error("Create blog post error:", err);
      setError("An unexpected error occurred while creating the blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell userRole={userRole}>
      <div className="space-y-6 max-w-[900px] animate-in fade-in duration-200">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard/blog"
            className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Blog Management</span>
          </Link>
        </div>

        {/* Header */}
        <div className="pb-4 border-b border-[#b6b6b6]/30">
          <div className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] mb-2 uppercase tracking-wider">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Authoring Studio</span>
          </div>
          <h1
            className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            Create New Blog Post
          </h1>
          <p className="text-[14px] text-[#1a3300]/75">
            Fill in the article details below to publish immediately or save as a private draft.
          </p>
        </div>

        {error && (
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-4 text-[#cb5521] text-[14px]">
            {error}
          </div>
        )}

        {/* Form */}
        <BlogForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEdit={false}
        />
      </div>
    </DashboardShell>
  );
}
