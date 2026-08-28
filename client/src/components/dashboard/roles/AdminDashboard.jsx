"use client";

import React from "react";
import Link from "next/link";
import { Shield, Users, BookOpen, Settings, UserCheck, ShieldAlert, Sparkles, Activity, ArrowRight } from "lucide-react";
import StatCard from "../shared/StatCard";
import SectionHeader from "../shared/SectionHeader";
import { MOCK_ADMIN_DATA } from "@/lib/mock-dashboard-data";

export default function AdminDashboard({ user }) {
  const { stats, userRoleDistribution, recentAuditLogs } = MOCK_ADMIN_DATA;
  const username = user?.username || user?.email?.split("@")[0] || "Administrator";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Admin Executive Header */}
      <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.05)_0px_4px_12px] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#f6d0ff] border border-[#1a3300]/20 px-3 py-1 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>System Executive Panel</span>
            </div>
            <h1
              className="text-[28px] sm:text-[36px] font-[800] text-[#1a3300] leading-tight tracking-[0.02em] mb-2"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              System Overview, <span className="bg-[#f6d0ff] px-2 py-0.5 rounded-[4px]">{username}</span>
            </h1>
            <p className="text-[15px] text-[#1a3300]/80 max-w-[600px]">
              Platform healthy. <strong className="font-bold text-[#1a3300]">3,850 total accounts</strong> registered across 4 system roles. HTTP-Only Cookie Authentication active.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button className="inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] px-5 py-3 rounded-[6px] text-[14px] font-medium hover:bg-[#1a3300]/90 transition-transform active:scale-[0.98] shadow-sm">
              <Users className="w-4 h-4 text-[#ffe95c]" />
              <span>User Management</span>
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

      {/* Grid: User Role Distribution & Quick Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: User Role Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader
            title="User Role Breakdown"
            subtitle="Distribution of registered user roles in PostgreSQL"
            badge="Platform Security"
            badgeBg="bg-[#f6d0ff]"
          />

          <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-6 space-y-5 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {userRoleDistribution.map((item, idx) => (
                <div key={idx} className="bg-[#fcfaf5] border border-[#1a3300]/15 rounded-[8px] p-3">
                  <span className="text-[10px] font-mono text-[#1a3300]/60 uppercase block mb-1">
                    {item.role}
                  </span>
                  <span
                    className="text-[20px] font-bold text-[#1a3300] block"
                    style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
                  >
                    {item.count.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-mono text-[#1a3300]/70">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>

            {/* Combined Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[12px] font-mono text-[#1a3300]/70">
                <span>Account Share Breakdown</span>
                <span>100% Total Ratio</span>
              </div>
              <div className="w-full h-4 bg-[#1a3300]/10 rounded-full overflow-hidden flex border border-[#1a3300]/20">
                {userRoleDistribution.map((item, idx) => (
                  <div
                    key={idx}
                    className={`h-full ${item.color} border-r border-[#1a3300]/20 last:border-0`}
                    style={{ width: `${item.percentage}%` }}
                    title={`${item.role}: ${item.count} (${item.percentage}%)`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Admin Action Shortcuts */}
        <div className="space-y-4">
          <SectionHeader
            title="System Actions"
            subtitle="Administrative shortcuts"
          />

          <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] p-4 space-y-3 shadow-sm">
            <button className="w-full flex items-center justify-between p-3 rounded-[8px] bg-[#d5f5c2]/40 border border-[#1a3300]/20 hover:bg-[#d5f5c2]/70 transition-colors text-left">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#1a3300]" />
                <div>
                  <span className="font-bold text-[14px] block leading-none mb-0.5">Manage Platform Users</span>
                  <span className="text-[11px] font-mono text-[#1a3300]/70">Roles, block/unblock, permissions</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#1a3300]/60" />
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-[8px] bg-[#ffe95c]/40 border border-[#1a3300]/20 hover:bg-[#ffe95c]/70 transition-colors text-left">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-[#1a3300]" />
                <div>
                  <span className="font-bold text-[14px] block leading-none mb-0.5">Course Catalog Audit</span>
                  <span className="text-[11px] font-mono text-[#1a3300]/70">All 24 active courses</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#1a3300]/60" />
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-[8px] bg-[#a8e5e5]/40 border border-[#1a3300]/20 hover:bg-[#a8e5e5]/70 transition-colors text-left">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-[#1a3300]" />
                <div>
                  <span className="font-bold text-[14px] block leading-none mb-0.5">System Security & API</span>
                  <span className="text-[11px] font-mono text-[#1a3300]/70">JWT, HTTP-only cookies, Strapi v5</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#1a3300]/60" />
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="space-y-4">
        <SectionHeader
          title="System Audit & Security Logs"
          subtitle="Recent administrative events and registration security enforcement"
        />

        <div className="bg-[#fcfaf5] border border-[#1a3300]/25 rounded-[12px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a3300]/5 border-b border-[#b6b6b6]/40 text-[11px] font-mono text-[#1a3300]/70 uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">User / Initiator</th>
                  <th className="py-3 px-4 font-bold">System Event</th>
                  <th className="py-3 px-4 font-bold">Target</th>
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#b6b6b6]/30 text-[13px]">
                {recentAuditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-[#1a3300]/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1a3300]">
                      @{log.user}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1a3300]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px] text-[#1a3300]/70">
                      {log.target}
                    </td>
                    <td className="py-3 px-4 text-[12px] text-[#1a3300]/70">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] border border-[#1a3300]/15 ${
                        log.status.includes("Blocked")
                          ? "bg-[#cb5521] text-[#fcfaf5]"
                          : "bg-[#d5f5c2] text-[#1a3300]"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
