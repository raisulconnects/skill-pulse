"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import {
  Shield,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";

const ALLOWED_ROLES = [
  { value: "student", label: "Student", color: "bg-[#d5f5c2] border-[#1a3300]/20 text-[#1a3300]" },
  { value: "instructor", label: "Instructor", color: "bg-[#ffe95c] border-[#1a3300]/20 text-[#1a3300]" },
  { value: "content_manager", label: "Content Manager", color: "bg-[#a8e5e5] border-[#1a3300]/20 text-[#1a3300]" },
  { value: "admin", label: "Administrator", color: "bg-[#f6d0ff] border-[#1a3300]/20 text-[#1a3300]" },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userRole = user?.user_role || "student";

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Server-side filtering & pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");      // immediate input value
  const [debouncedSearch, setDebouncedSearch] = useState(""); // debounced value sent to API
  const [roleFilter, setRoleFilter] = useState("all");
  const [paginationMeta, setPaginationMeta] = useState({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    total: 0,
  });

  // Debounce: update debouncedSearch 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Inline role editing states: { [userId]: selectedRole }
  const [pendingRoles, setPendingRoles] = useState({});
  const [savingUserId, setSavingUserId] = useState(null);
  const [successToast, setSuccessToast] = useState("");

  // Fetch paginated platform users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search: debouncedSearch.trim(),
        role: roleFilter,
      });

      const res = await fetch(`/api/users?${params.toString()}`);
      const resData = await res.json();

      if (res.ok) {
        // Handle paginated structure { data: [...], meta: { pagination: {...} } } or legacy array
        if (Array.isArray(resData.data)) {
          setUsersList(resData.data);
          if (resData.meta?.pagination) {
            setPaginationMeta(resData.meta.pagination);
          } else {
            setPaginationMeta({
              page: 1,
              pageSize: resData.data.length,
              pageCount: 1,
              total: resData.data.length,
            });
          }
        } else if (Array.isArray(resData)) {
          setUsersList(resData);
          setPaginationMeta({
            page: 1,
            pageSize: resData.length,
            pageCount: 1,
            total: resData.length,
          });
        }
      } else {
        setError(resData.error?.message || resData.error || "Failed to fetch platform users.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("An unexpected error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, roleFilter]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "admin") {
      router.replace("/dashboard");
      return;
    }

    fetchUsers();
  }, [authLoading, user, userRole, fetchUsers]);

  // Update immediate input value (debounce effect handles the page reset + API call)
  const handleSearchChange = (val) => {
    setSearchQuery(val);
  };

  const handleRoleFilterChange = (val) => {
    setRoleFilter(val);
    setPage(1);
  };

  const handlePageSizeChange = (val) => {
    setPageSize(Number(val));
    setPage(1);
  };

  // Handle dropdown role selection for a user
  const handleRoleSelect = (userId, newRole) => {
    setPendingRoles((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  // Persist role change to Strapi backend
  const handleSaveRole = async (targetUser) => {
    const targetId = targetUser.id || targetUser.documentId;
    const newRole = pendingRoles[targetId];

    if (!newRole || newRole === targetUser.user_role) return;

    setSavingUserId(targetId);
    setError("");
    setSuccessToast("");

    try {
      const res = await fetch(`/api/users/${targetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_role: newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update local state immediately
        setUsersList((prev) =>
          prev.map((u) =>
            (u.id || u.documentId) === targetId ? { ...u, user_role: newRole } : u
          )
        );

        // Clear pending role for this user
        setPendingRoles((prev) => {
          const next = { ...prev };
          delete next[targetId];
          return next;
        });

        const targetName = targetUser.username || targetUser.email;
        setSuccessToast(`Successfully updated @${targetName}'s role to "${newRole}".`);
        setTimeout(() => setSuccessToast(""), 4000);
      } else {
        setError(data.error?.message || data.error || "Failed to update user role.");
      }
    } catch (err) {
      console.error("Error saving user role:", err);
      setError("An error occurred while saving the role change.");
    } finally {
      setSavingUserId(null);
    }
  };

  const totalUsers = paginationMeta.total || usersList.length;
  const pageCount = paginationMeta.pageCount || 1;
  const startItem = totalUsers > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, totalUsers);

  return (
    <DashboardShell userRole="admin">
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
            <div className="inline-flex items-center gap-1.5 bg-[#f6d0ff] border border-[#1a3300]/20 px-3 py-1 rounded-[4px] text-[11px] font-mono font-medium text-[#1a3300] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>System Executive Panel</span>
            </div>
            <h1
              className="text-[26px] sm:text-[32px] font-[800] text-[#1a3300] leading-tight"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              User & Role Management
            </h1>
            <p className="text-[14px] text-[#1a3300]/80 mt-1 max-w-[600px]">
              Manage registered platform accounts, assign system roles, and control workspace permissions with server-side pagination.
            </p>
          </div>

          <div className="bg-[#1a3300]/5 border border-[#1a3300]/20 rounded-[12px] p-4 text-center shrink-0 min-w-[150px]">
            <span className="text-[11px] font-mono text-[#1a3300]/60 uppercase block">Platform Users</span>
            <span className="text-[28px] font-bold text-[#1a3300]">{totalUsers}</span>
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
          <div className="bg-[#fcd0d0] border border-[#cb5521] rounded-[8px] p-3 text-[#cb5521] text-[13px] flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* User Table Container */}
        <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 shadow-sm space-y-5">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#b6b6b6]/30">
            {/* Search Input */}
            <div className="relative flex-1 max-w-[320px]">
              <Search className="w-4 h-4 text-[#1a3300]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Search users"
                placeholder="Search username or email..."
                className="w-full bg-white border border-[#1a3300]/25 rounded-[8px] pl-9 pr-3 py-2 text-[13px] text-[#1a3300] placeholder-[#1a3300]/40 focus:outline-none focus:ring-2 focus:ring-[#1a3300]/30 transition-all"
              />
            </div>

            {/* Role Filter Tabs & Page Size Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-[#1a3300]/5 p-1 rounded-[8px] border border-[#1a3300]/15 text-[12px] font-mono overflow-x-auto">
                <button
                  onClick={() => handleRoleFilterChange("all")}
                  className={`px-3 py-1.5 rounded-[5px] transition-colors whitespace-nowrap ${
                    roleFilter === "all" ? "bg-[#1a3300] text-[#fcfaf5] font-bold" : "text-[#1a3300]/70 hover:text-[#1a3300]"
                  }`}
                >
                  All
                </button>
                {ALLOWED_ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => handleRoleFilterChange(r.value)}
                    className={`px-3 py-1.5 rounded-[5px] transition-colors whitespace-nowrap ${
                      roleFilter === r.value ? "bg-[#1a3300] text-[#fcfaf5] font-bold" : "text-[#1a3300]/70 hover:text-[#1a3300]"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Page Size Select */}
              <div className="flex items-center gap-1.5 text-[12px] font-mono text-[#1a3300]/70">
                <span>Per Page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
                  className="bg-white border border-[#1a3300]/25 rounded-[6px] px-2 py-1 text-[12px] font-mono text-[#1a3300] focus:outline-none focus:ring-1 focus:ring-[#1a3300]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-[#1a3300]">
              <div className="w-7 h-7 border-3 border-[#1a3300] border-t-[#ffe95c] rounded-full animate-spin mx-auto mb-2" />
              <p className="font-mono text-[13px] text-[#1a3300]/70">Loading platform users...</p>
            </div>
          ) : usersList.length === 0 ? (
            <div className="p-8 text-center bg-[#1a3300]/5 rounded-[8px] border border-dashed border-[#1a3300]/20">
              <Users className="w-8 h-8 text-[#1a3300]/40 mx-auto mb-2" />
              <p className="text-[14px] text-[#1a3300]/70 font-medium">No users found</p>
              <p className="text-[12px] font-mono text-[#1a3300]/50 mt-1">
                {searchQuery || roleFilter !== "all"
                  ? "No accounts matched your search or role filter."
                  : "No platform accounts registered in Strapi."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1a3300]/20 text-[11px] font-mono text-[#1a3300]/60 uppercase tracking-wider">
                      <th className="pb-3 pt-1 px-3">User Account</th>
                      <th className="pb-3 pt-1 px-3">Joined Date</th>
                      <th className="pb-3 pt-1 px-3">Current Role</th>
                      <th className="pb-3 pt-1 px-3">Assign New Role</th>
                      <th className="pb-3 pt-1 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#b6b6b6]/25 text-[13px]">
                    {usersList.map((u) => {
                      const uId = u.id || u.documentId;
                      const isSaving = savingUserId === uId;
                      const currentRole = u.user_role || "student";
                      const pendingRole = pendingRoles[uId] || currentRole;
                      const roleChanged = pendingRole !== currentRole;

                      const roleMeta = ALLOWED_ROLES.find((r) => r.value === currentRole) || ALLOWED_ROLES[0];
                      const dateStr = u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Registered";

                      return (
                        <tr key={uId} className="hover:bg-[#1a3300]/3 transition-colors">
                          {/* User identity */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#1a3300] text-[#fcfaf5] font-mono text-[12px] font-bold flex items-center justify-center shrink-0">
                                {(u.username || u.email || "U")[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-[14px] text-[#1a3300] block truncate">
                                  @{u.username || "user"}
                                </span>
                                <span className="text-[11px] font-mono text-[#1a3300]/60 block truncate">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Joined Date */}
                          <td className="py-3.5 px-3 font-mono text-[12px] text-[#1a3300]/70">
                            {dateStr}
                          </td>

                          {/* Current Role Badge */}
                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-block text-[11px] font-mono font-bold px-2.5 py-1 rounded-[4px] border ${roleMeta.color}`}
                            >
                              {roleMeta.label}
                            </span>
                          </td>

                          {/* Assign New Role Select */}
                          <td className="py-3.5 px-3">
                            <select
                              value={pendingRole}
                              onChange={(e) => handleRoleSelect(uId, e.target.value)}
                              disabled={isSaving}
                              className={`bg-white border rounded-[6px] px-3 py-1.5 text-[13px] text-[#1a3300] font-medium focus:outline-none focus:ring-2 focus:ring-[#1a3300]/30 transition-all ${
                                roleChanged ? "border-[#1a3300] bg-[#ffe95c]/20" : "border-[#1a3300]/25"
                              }`}
                            >
                              {ALLOWED_ROLES.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleSaveRole(u)}
                              disabled={!roleChanged || isSaving}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] text-[12px] font-mono font-bold transition-all ${
                                roleChanged
                                  ? "bg-[#1a3300] text-[#fcfaf5] hover:bg-[#1a3300]/90 shadow-xs cursor-pointer"
                                  : "bg-[#1a3300]/5 text-[#1a3300]/30 border border-[#1a3300]/10 cursor-not-allowed"
                              }`}
                            >
                              {isSaving ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-[#fcfaf5] border-t-transparent rounded-full animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Save Role</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION FOOTER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#b6b6b6]/30">
                <div className="text-[12px] font-mono text-[#1a3300]/70">
                  Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalUsers}</strong> platform users
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-[12px] font-mono font-medium text-[#1a3300] bg-[#1a3300]/5 border border-[#1a3300]/20 hover:bg-[#1a3300]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1 px-2 text-[12px] font-mono font-bold text-[#1a3300]">
                    <span>Page {page} of {pageCount}</span>
                  </div>

                  <button
                    type="button"
                    disabled={page >= pageCount || loading}
                    onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-[12px] font-mono font-medium text-[#1a3300] bg-[#1a3300]/5 border border-[#1a3300]/20 hover:bg-[#1a3300]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
