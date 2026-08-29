"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  FileText,
  User,
  Calendar,
  ArrowRight,
  Sparkles,
  BookOpen,
  Compass,
} from "lucide-react";

export default function PublicBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    // Request published blog posts from API
    fetch("/api/blogs?filters[post_status][$eq]=published&populate[0]=author&populate[1]=cover_image")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setPosts(data.data);
        } else if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setPosts([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching published blog posts:", err);
        setError("Failed to load blog articles.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfaf5] text-[#1a3300] flex flex-col font-sans selection:bg-[#ffe95c] selection:text-[#1a3300]">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-300">
        {/* Header Hero Section */}
        <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[20px] p-8 sm:p-12 shadow-[rgba(0,0,0,0.06)_0px_4px_16px] relative overflow-hidden text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-[700px] space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#ffe95c] border border-[#1a3300]/20 px-3 py-1 rounded-[6px] text-[12px] font-mono font-medium text-[#1a3300] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>SkillPulse Engineering & Learning Journal</span>
            </div>
            <h1
              className="text-[32px] sm:text-[44px] font-[800] text-[#1a3300] leading-tight tracking-[0.01em]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Articles, Guides & Insights
            </h1>
            <p className="text-[16px] text-[#1a3300]/80 leading-relaxed max-w-[620px]">
              Explore technical guides, learning methodologies, system architecture breakdowns, and platform updates written by the SkillPulse faculty.
            </p>
          </div>

          <div className="bg-[#d5f5c2]/40 border border-[#1a3300]/20 rounded-[14px] p-6 text-center shrink-0 min-w-[200px] shadow-xs">
            <span className="text-[11px] font-mono text-[#1a3300]/70 uppercase tracking-wider block mb-1">
              Published Articles
            </span>
            <span
              className="text-[36px] font-bold text-[#1a3300] block"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              {loading ? "..." : posts.length}
            </span>
            <span className="text-[12px] font-mono text-[#1a3300]/70">
              Open to all learners
            </span>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[10px] p-4 text-[#cb5521] text-[14px]">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="py-20 text-center text-[#1a3300]">
            <div className="w-10 h-10 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-[14px] text-[#1a3300]/70">Loading articles...</p>
          </div>
        ) : posts.length === 0 ? (
          /* Empty state */
          <div className="py-16 px-6 text-center bg-[#fcfaf5] border border-dashed border-[#1a3300]/30 rounded-[16px] max-w-[600px] mx-auto space-y-3">
            <div className="w-14 h-14 bg-[#1a3300]/5 border border-[#1a3300]/20 rounded-full flex items-center justify-center mx-auto text-[#1a3300]/40">
              <FileText className="w-7 h-7" />
            </div>
            <h3
              className="text-[20px] font-bold text-[#1a3300]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              No Published Posts Yet
            </h3>
            <p className="text-[14px] text-[#1a3300]/70 max-w-[420px] mx-auto leading-relaxed">
              There are currently no published blog articles available. Check back soon for new content from our engineering team!
            </p>
          </div>
        ) : (
          /* Blog Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const postId = post.documentId || post.id;
              const coverUrl = post.cover_image_url || post.cover_image?.url;
              const authorName = post.author?.username || post.author?.email || "SkillPulse Faculty";
              const dateStr = post.createdAt
                ? new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Publication";

              // Extract excerpt
              let excerpt = "";
              if (typeof post.description === "string") {
                excerpt = post.description;
              } else if (Array.isArray(post.description)) {
                excerpt = post.description
                  .map((b) => b?.children?.map((c) => c.text).join("") || "")
                  .join(" ");
              }

              return (
                <div
                  key={postId}
                  className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[16px] overflow-hidden flex flex-col justify-between hover:border-[#1a3300] hover:shadow-[rgba(0,0,0,0.08)_0px_6px_20px] transition-all duration-300 group"
                >
                  {/* Thumbnail / Header Banner */}
                  <div className="h-48 bg-[#d5f5c2]/30 border-b border-[#1a3300]/15 relative overflow-hidden flex items-center justify-center">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-12 h-12 rounded-[10px] bg-[#ffe95c] border border-[#1a3300]/20 flex items-center justify-center mx-auto mb-2 text-[#1a3300] shadow-xs">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-mono font-medium text-[#1a3300]/70 uppercase tracking-wider">
                          Article
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#1a3300]/60 uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span className="bg-[#1a3300]/5 px-2 py-0.5 rounded-[4px] border border-[#1a3300]/10">
                          Published
                        </span>
                      </div>

                      <h2
                        className="text-[20px] font-bold text-[#1a3300] leading-snug group-hover:text-[#1a3300] transition-colors line-clamp-2"
                        style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                      >
                        <Link href={`/blog/${postId}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </h2>

                      {excerpt && (
                        <p className="text-[14px] text-[#1a3300]/75 line-clamp-3 leading-relaxed">
                          {excerpt}
                        </p>
                      )}
                    </div>

                    {/* Footer / Author info & Read More */}
                    <div className="pt-4 border-t border-[#b6b6b6]/30 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#1a3300] text-[#fcfaf5] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                          {authorName[0]?.toUpperCase() || "A"}
                        </div>
                        <span className="text-[12px] font-medium text-[#1a3300]/80 truncate">
                          @{authorName}
                        </span>
                      </div>

                      <Link
                        href={`/blog/${postId}`}
                        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1a3300] hover:text-[#1a3300] transition-transform group-hover:translate-x-0.5"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-4 h-4 text-[#1a3300]" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
