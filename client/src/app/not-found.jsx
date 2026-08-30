import Link from "next/link";
import { Compass, ArrowLeft, Home, BookOpen, AlertTriangle, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fcfaf5] text-[#1a3300] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#1a3300 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 max-w-[620px] w-full text-center">
        {/* Top 404 Badge */}
        <div className="inline-flex items-center gap-2 bg-[#ffe95c] border border-[#1a3300]/20 px-3.5 py-1 rounded-[6px] text-[12px] font-mono font-bold text-[#1a3300] mb-6 shadow-xs animate-float">
          <AlertTriangle className="w-4 h-4 text-[#cb5521]" />
          <span>ERROR 404 · PAGE NOT FOUND</span>
        </div>

        {/* Big Stylized 404 Display */}
        <div className="relative mb-6">
          <h1
            className="text-[96px] sm:text-[130px] font-[900] leading-none text-[#1a3300] tracking-tighter font-bricolage select-none"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            404
          </h1>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#a8e5e5] text-[#1a3300] text-[11px] font-mono font-bold px-3 py-0.5 rounded-[4px] border border-[#1a3300]/20 whitespace-nowrap shadow-xs rotate-[-2deg]">
            404_ROUTE_EXCEPTION: UNMAPPED_PATH
          </div>
        </div>

        {/* Main Heading & Subhead */}
        <h2
          className="text-[26px] sm:text-[34px] font-[800] text-[#1a3300] leading-tight mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
        >
          Looks like you've strayed off the <span className="marker-highlight">curriculum</span> path.
        </h2>

        <p className="text-[15px] sm:text-[17px] text-[#1a3300]/80 leading-relaxed mb-8 max-w-[500px] mx-auto font-normal">
          The page or resource you are looking for doesn't exist or might have been moved to another route in SkillPulse.
        </p>

        {/* Code terminal mock box */}
        <div className="bg-[#1a3300] text-[#fcfaf5] rounded-[12px] p-4 text-left font-mono text-[13px] mb-8 shadow-sm border border-[#1a3300]">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#fcfaf5]/15 text-[#fcfaf5]/50 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-[#ffe95c]" />
            <span>skillpulse-router ~ diagnose</span>
          </div>
          <p className="text-[#ffe95c]">$ request.url --check-route</p>
          <p className="text-[#d5f5c2] mt-1">✗ Result: 404 Route Not Found</p>
          <p className="text-[#fcfaf5]/60 mt-1">→ Recommendation: Return to Dashboard or Explore Courses</p>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* <Link
            href="/dashboard"
            className="btn-interactive w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1a3300] text-[#fcfaf5] font-medium text-[14px] px-6 py-3 rounded-[6px] hover:bg-[#1a3300]/95 shadow-sm"
          >
            <Home className="w-4 h-4 text-[#ffe95c]" />
            <span>Back to Dashboard</span>
          </Link>
*/}
          <Link
            href="/dashboard/courses"
            className="btn-interactive w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#d5f5c2] border border-[#1a3300] text-[#1a3300] font-medium text-[14px] px-6 py-3 rounded-[6px] hover:bg-[#d5f5c2]/90"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Catalog</span>
          </Link>

          <Link
            href="/"
            className="btn-interactive w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-[#1a3300]/30 text-[#1a3300] font-medium text-[14px] px-5 py-3 rounded-[6px] hover:bg-[#1a3300]/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
