"use client";

import React, { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

export default function DashboardShell({
  userRole = "student",
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");

  return (
    <div className="min-h-screen bg-[#fcfaf5] text-[#1a3300] flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        userRole={userRole}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Header */}
        <DashboardHeader
          userRole={userRole}
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
