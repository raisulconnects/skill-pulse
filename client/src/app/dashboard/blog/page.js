"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import DeleteBlogModal from "@/components/blog/DeleteBlogModal";
import {
  FileText,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  Send,
  EyeOff,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  User,
  Image as ImageIcon,
} from "lucide-react";

export default function BlogManagementPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userRole = user?.user_role || "student";

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingPostId, setTogglingPostId] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      setPosts(list);
    } catch (err) {
      console.error("Error loading blog posts:", err);
      setError("Failed to load blog posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user || (userRole !== "admin" && userRole !== "content_manager")) {
      router.replace("/dashboard");
      return;
    }

    loadPosts();
  }, [authLoading, user, userRole]);

  // Handle inline Publish / Unpublish status toggle
  const handleToggleStatus = async (post) => {
    const postId = post.documentId || post.id;
    const newStatus = post.post_status === "published" ? "draft" : "published";
    setTogglingPostId(postId);

    try {
      const res = await fetch(`/api/blogs/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { post_status: newStatus },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            (p.documentId || p.id) === postId ? { ...p, post_status: newStatus } : p
          )
        );
        const actionLabel = newStatus === "published" ? "Published" : "Unpublished (Draft)";
        setSuccessToast(`Post "${post.title}" is now ${actionLabel}.`);
        setTimeout(() => setSuccessToast(""), 4000);
      } else {
        alert(data.error?.message || data.error || "Failed to change post status.");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("An error occurred while updating status.");
    } finally {
      setTogglingPostId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    const postId = postToDelete.documentId || postToDelete.id;

    try {
      const res = await fetch(`/api/blogs/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => (p.documentId || p.id) !== postId));
        setPostToDelete(null);
        setSuccessToast(`Deleted "${postToDelete.title}" successfully.`);
        setTimeout(() => setSuccessToast(""), 4000);
      } else {
        const data = await res.json();
        alert(data.error?.message || data.error || "Failed to delete blog post.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting the blog post.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesStatus =
      statusFilter === "all" || (p.post_status || "draft") === statusFilter;
    const authorName = p.author?.username || p.author?.email || "";
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardShell userRole={userRole}>
      <div className="max-w-[1000px] animate-in fade-in duration-200 space-y-6">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[#1a3300]/70 hover:text-[#1a3300] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard Overview</span>
          </Link>
        </div>

        {/* Header Banner */}
        <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#ffe95c] border border-[#1a3300]/20 px-3 py-1 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Editorial CMS</span>
            </div>
            <h1
              className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Blog Posts Management
            </h1>
            <p className="text-[14px] text-[#1a3300]/80 mt-1 max-w-[600px]">
              Create, edit, publish, draft, and delete platform articles and announcements.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/blog/create"
              className="inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-3 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#ffe95c]" />
              <span>Create Post</span>
            </Link>
          </div>
        </div>

        {/* Feedback toasts */}
        {successToast && (
          <div className="bg-[#d5f5c2] border border-[#1a3300]/20 rounded-[8px] p-3 text-[#1a3300] text-[13px] font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#1a3300] shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {error && (
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-4 text-[#cb5521] text-[14px]">
            {error}
          </div>
        )}

        {/* Filter & Controls Bar */}
        <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-mono text-[12px]">
            {["all", "published", "draft"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-[6px] font-medium capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-[#1a3300] text-[#fcfaf5]"
                    : "bg-[#fcfaf5] border border-[#1a3300]/20 text-[#1a3300]/70 hover:text-[#1a3300] hover:bg-[#1a3300]/5"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1a3300]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full bg-white border border-[#1a3300]/30 rounded-[6px] pl-9 pr-4 py-2 text-[13px] text-[#1a3300] placeholder:text-[#1a3300]/40 focus:outline-none focus:border-[#1a3300] transition-colors"
            />
          </div>
        </div>

        {/* Post Grid / List */}
        {loading ? (
          <div className="py-16 text-center text-[#1a3300]">
            <div className="w-8 h-8 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-[13px] text-[#1a3300]/70">Loading blog posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center bg-[#1a3300]/5 rounded-[12px] border border-dashed border-[#1a3300]/20">
            <FileText className="w-8 h-8 text-[#1a3300]/40 mx-auto mb-2" />
            <p className="text-[14px] text-[#1a3300]/70 font-medium">No blog posts found</p>
            <p className="text-[12px] font-mono text-[#1a3300]/50 mt-1">
              No articles matched your selected status filter or search query.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const pId = String(post.documentId || post.id);
              const isPublished = post.post_status === "published";
              const authorName = post.author?.username || post.author?.email || "Editorial Team";
              const isToggling = togglingPostId === pId;

              const coverUrl = post.cover_image_url || post.cover_image?.url;
              const dateStr = post.createdAt
                ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "Recent";

              // Extract description text
              let bodyExcerpt = "";
              if (typeof post.description === "string") {
                bodyExcerpt = post.description;
              } else if (Array.isArray(post.description)) {
                bodyExcerpt = post.description
                  .map((b) => b?.children?.map((c) => c.text).join("") || "")
                  .join(" ");
              }

              return (
                <div
                  key={pId}
                  className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-5 shadow-sm hover:border-[#1a3300] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  {/* Left: Thumbnail & Content */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-[8px] bg-[#1a3300]/5 border border-[#1a3300]/15 overflow-hidden shrink-0 flex items-center justify-center">
                      {coverUrl ? (
                        <img src={coverUrl} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-6 h-6 text-[#1a3300]/40" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] border uppercase ${
                            isPublished
                              ? "bg-[#d5f5c2] border-[#1a3300]/20 text-[#1a3300]"
                              : "bg-[#ffe95c] border-[#1a3300]/30 text-[#1a3300]"
                          }`}
                        >
                          {isPublished ? "Published" : "Draft (Private)"}
                        </span>

                        <span className="text-[11px] font-mono text-[#1a3300]/60">
                          {dateStr}
                        </span>
                      </div>

                      <h3
                        className="text-[16px] font-bold text-[#1a3300] truncate"
                        style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                      >
                        {post.title}
                      </h3>

                      {bodyExcerpt && (
                        <p className="text-[13px] text-[#1a3300]/70 line-clamp-1">
                          {bodyExcerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#1a3300]/60 pt-0.5">
                        <User className="w-3 h-3" />
                        <span>By @{authorName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Toggle Status Button */}
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggleStatus(post)}
                      className={`inline-flex items-center gap-1.5 text-[12px] font-mono font-bold px-3 py-1.5 rounded-[6px] border transition-colors ${
                        isPublished
                          ? "bg-[#ffe95c]/30 text-[#1a3300] border-[#1a3300]/20 hover:bg-[#ffe95c]"
                          : "bg-[#d5f5c2]/40 text-[#1a3300] border-[#1a3300]/20 hover:bg-[#d5f5c2]"
                      }`}
                      title={isPublished ? "Unpublish to draft" : "Publish to public"}
                    >
                      {isToggling ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#1a3300] border-t-transparent rounded-full animate-spin" />
                      ) : isPublished ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-[#1a3300]" />
                          <span>Unpublish</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-[#1a3300]" />
                          <span>Publish</span>
                        </>
                      )}
                    </button>

                    {/* Edit button */}
                    <Link
                      href={`/dashboard/blog/${pId}/edit`}
                      className="inline-flex items-center justify-center gap-1 text-[12px] font-medium text-[#1a3300] bg-[#1a3300]/5 border border-[#1a3300]/20 rounded-[6px] px-3 py-1.5 hover:bg-[#1a3300]/10 transition-colors"
                      title="Edit Post"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setPostToDelete(post)}
                      className="inline-flex items-center justify-center p-1.5 text-[#cb5521] border border-[#cb5521]/30 rounded-[6px] hover:bg-[#cb5521]/10 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteBlogModal
        isOpen={!!postToDelete}
        postTitle={postToDelete?.title || ""}
        onConfirm={handleDeleteConfirm}
        onClose={() => setPostToDelete(null)}
        isDeleting={isDeleting}
      />
    </DashboardShell>
  );
}
