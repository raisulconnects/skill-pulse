"use client";

import React, { useState } from "react";
import { Layers, FileText, CheckCircle2, AlertCircle, PlusCircle, Search, Filter, Sparkles, HelpCircle } from "lucide-react";
import StatCard from "../shared/StatCard";
import SectionHeader from "../shared/SectionHeader";
import { MOCK_CONTENT_MANAGER_DATA } from "@/lib/mock-dashboard-data";

export default function ContentManagerDashboard({ user }) {
  const { stats, contentCatalog, recentUpdates } = MOCK_CONTENT_MANAGER_DATA;
  const [filterTab, setFilterTab] = useState("all");
  const username = user?.username || user?.email?.split("@")[0] || "Content Manager";

  const filteredCatalog = contentCatalog.filter((item) => {
    if (filterTab === "published") return item.status === "Published";
    if (filterTab === "review") return item.status === "Needs Review";
    if (filterTab === "draft") return item.status === "Draft";
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Content Manager Header Banner */}
      <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.05)_0px_4px_12px] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#a8e5e5] border border-[#1a3300]/20 px-3 py-1 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Content Management Hub</span>
            </div>
            <h1
              className="text-[28px] sm:text-[36px] font-[800] text-[#1a3300] leading-tight tracking-[0.02em] mb-2"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Platform Content Overview, <span className="bg-[#a8e5e5] px-2 py-0.5 rounded-[4px]">{username}</span>
            </h1>
            <p className="text-[15px] text-[#1a3300]/80 max-w-[600px]">
              Managing <strong className="font-bold text-[#1a3300]">24 courses & 210 lessons</strong>. You have <span className="font-bold text-[#cb5521]">1 item</span> awaiting content review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-3 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm">
              <PlusCircle className="w-4 h-4 text-[#ffe95c]" />
              <span>Add Platform Content</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <StatCard
            key={idx}
            label={s.label}
            value={s.value}
            trend={s.trend}
            variant={s.variant}
          />
        ))}
      </div>

      {/* Main Content Catalog Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SectionHeader
            title="Course Catalog & Moderation"
            subtitle="Platform-wide learning resources and publication status"
            badge="Catalog Audit"
            badgeBg="bg-[#a8e5e5]"
          />

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#fcfaf5] border border-[#1a3300]/20 p-1 rounded-[8px] self-start sm:self-auto font-mono text-[12px]">
            {["all", "published", "review", "draft"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-[5px] font-medium capitalize transition-colors ${
                  filterTab === tab
                    ? "bg-[#1a3300] text-[#fcfaf5]"
                    : "text-[#1a3300]/70 hover:text-[#1a3300] hover:bg-[#1a3300]/5"
                }`}
              >
                {tab === "review" ? "Needs Review" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Table */}
        <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a3300]/5 border-b border-[#b6b6b6]/40 text-[11px] font-mono text-[#1a3300]/70 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-bold">Course Title</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Author</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Lessons</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#b6b6b6]/30 text-[14px]">
                {filteredCatalog.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1a3300]/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1a3300]">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12px] text-[#1a3300]/75">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 text-[#1a3300]/80">
                      {item.author}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-[4px] border border-[#1a3300]/15 text-[#1a3300] ${item.statusBg}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[13px] text-[#1a3300]/80">
                      {item.lessonsCount} lessons
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-[12px] font-medium text-[#1a3300] border border-[#1a3300] rounded-[6px] px-3 py-1 hover:bg-[#1a3300]/10 transition-colors">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Feed */}
      <div className="space-y-4">
        <SectionHeader
          title="Recent Content Activity"
          subtitle="Audit log of recent course edits, quiz additions, and status changes"
        />

        <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-4 divide-y divide-[#b6b6b6]/30">
          {recentUpdates.map((update, idx) => (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase bg-[#a8e5e5] px-2 py-0.5 rounded-[4px] border border-[#1a3300]/15 text-[#1a3300]">
                    {update.type}
                  </span>
                  <span className="font-bold text-[14px] text-[#1a3300]">
                    {update.title}
                  </span>
                </div>
                <p className="text-[12px] text-[#1a3300]/70">
                  By {update.author} • {update.timestamp}
                </p>
              </div>

              <span className="text-[11px] font-mono text-[#1a3300]/80 bg-[#1a3300]/10 px-2.5 py-1 rounded-[4px]">
                {update.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
