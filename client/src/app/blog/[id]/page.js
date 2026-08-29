"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  FileText,
  User,
  Calendar,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  BookOpen,
} from "lucide-react";

export default function PublicBlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    setNotFound(false);
    setError("");

    fetch(`/api/blogs/${postId}`)
      .then((res) => {
        if (res.status === 404 || res.status === 403) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        const postData = data.data || data;
        // Strict Draft Protection check:
        if (postData && postData.post_status === "published") {
          setPost(postData);
        } else {
          // If draft or invalid status, treat as not found for public reader!
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error("Error fetching blog post detail:", err);
        setError("Failed to load article.");
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const coverUrl = post?.cover_image_url || post?.cover_image?.url;
  const authorName = post?.author?.username || post?.author?.email || "SkillPulse Faculty";
  const dateStr = post?.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Publication";

  // Parse body text if blocks format or string
  let bodyParagraphs = [];
  if (typeof post?.description === "string") {
    bodyParagraphs = post.description.split("\n\n").filter(Boolean);
  } else if (Array.isArray(post?.description)) {
    bodyParagraphs = post.description
      .map((b) => b?.children?.map((c) => c.text).join("") || "")
      .filter(Boolean);
  }

  return (
    <div className="min-h-screen bg-[#fcfaf5] text-[#1a3300] flex flex-col font-sans selection:bg-[#ffe95c] selection:text-[#1a3300]">
      <Navbar />

      <main className="flex-1 max-w-[900px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[13px] font-mono text-[#1a3300]/80 hover:text-[#1a3300] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-[#1a3300]">
            <div className="w-10 h-10 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-[14px] text-[#1a3300]/70">Loading article...</p>
          </div>
        ) : notFound ? (
          /* Draft Protection / Not Found State */
          <div className="py-16 px-6 text-center bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[20px] max-w-[540px] mx-auto space-y-4 my-12 shadow-md">
            <div className="w-14 h-14 bg-[#cb5521]/10 border border-[#cb5521]/30 rounded-full flex items-center justify-center mx-auto text-[#cb5521]">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2
              className="text-[24px] font-bold text-[#1a3300]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Article Not Found
            </h2>
            <p className="text-[14px] text-[#1a3300]/80 max-w-[420px] mx-auto leading-relaxed">
              The requested article is either unpublished, kept as a private draft, or does not exist on SkillPulse.
            </p>
            <div className="pt-2">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-6 py-2.5 rounded-[8px] text-[13px] font-medium hover:bg-[#1a3300]/90 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-[#ffe95c]" />
                <span>Explore Published Articles</span>
              </Link>
            </div>
          </div>
        ) : error ? (
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[10px] p-4 text-[#cb5521] text-[14px]">
            {error}
          </div>
        ) : post && (
          /* Main Article View */
          <article className="space-y-8 bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[20px] p-6 sm:p-10 shadow-sm">
            {/* Header metadata */}
            <div className="space-y-4 pb-6 border-b border-[#b6b6b6]/30">
              <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono text-[#1a3300]/70">
                <span className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 px-3 py-0.5 rounded-[4px] font-bold text-[#1a3300] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Publication
                </span>

                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {dateStr}
                </span>

                <span>•</span>

                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Written by @{authorName}
                </span>
              </div>

              <h1
                className="text-[28px] sm:text-[40px] font-[800] text-[#1a3300] leading-tight tracking-[0.01em]"
                style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
              >
                {post.title}
              </h1>
            </div>

            {/* Optional Cover Image */}
            {coverUrl && (
              <div className="w-full h-[280px] sm:h-[400px] rounded-[14px] overflow-hidden border border-[#1a3300]/20 bg-[#1a3300]/5 shadow-xs">
                <img
                  src={coverUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Article Body Content */}
            <div className="prose max-w-none text-[#1a3300] space-y-6 text-[16px] sm:text-[17px] leading-relaxed font-sans pt-2">
              {bodyParagraphs.length > 0 ? (
                bodyParagraphs.map((para, idx) => (
                  <p key={idx} className="text-[#1a3300]/90 leading-relaxed whitespace-pre-line">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-[#1a3300]/90 leading-relaxed">
                  {post.description}
                </p>
              )}
            </div>

            {/* Article Footer */}
            <div className="pt-8 border-t border-[#b6b6b6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a3300] text-[#fcfaf5] font-mono text-[14px] font-bold flex items-center justify-center shrink-0">
                  {authorName[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <span className="font-bold text-[14px] text-[#1a3300] block leading-none mb-1">
                    @{authorName}
                  </span>
                  <span className="text-[12px] font-mono text-[#1a3300]/60">
                    SkillPulse Author
                  </span>
                </div>
              </div>

              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 bg-[#1a3300]/5 border border-[#1a3300]/20 text-[#1a3300] px-5 py-2.5 rounded-[8px] text-[13px] font-medium hover:bg-[#1a3300]/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>More Articles</span>
              </Link>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
