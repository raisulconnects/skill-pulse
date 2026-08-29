"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import BlogForm from "@/components/blog/BlogForm";
import { Edit3, ArrowLeft, ShieldAlert } from "lucide-react";

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const postId = params?.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const userRole = user?.user_role || "student";

  // Fetch initial post data
  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    fetch(`/api/blogs/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setPost(data.data);
        } else {
          setError(data.error?.message || data.error || "Blog post not found.");
        }
      })
      .catch((err) => {
        console.error("Error loading blog post:", err);
        setError("Failed to load article details.");
      })
      .finally(() => setLoading(false));
  }, [postId]);

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
            Only Administrators and Content Managers can edit blog posts.
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
      const res = await fetch(`/api/blogs/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard/blog");
      } else {
        setError(data.error?.message || data.error || "Failed to update blog post.");
      }
    } catch (err) {
      console.error("Update blog post error:", err);
      setError("An unexpected error occurred while updating the blog post.");
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
          <div className="inline-flex items-center gap-1.5 bg-[#a8e5e5] border border-[#1a3300]/20 px-2.5 py-0.5 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] mb-2 uppercase tracking-wider">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Article Editor</span>
          </div>
          <h1
            className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            Edit Blog Post
          </h1>
          <p className="text-[14px] text-[#1a3300]/75">
            Modify article details, cover image, or change publishing state.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading article details...</p>
          </div>
        ) : error ? (
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-4 text-[#cb5521] text-[14px]">
            {error}
          </div>
        ) : (
          <BlogForm
            initialData={post}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEdit={true}
          />
        )}
      </div>
    </DashboardShell>
  );
}
