import { BookOpenCheck, Zap, Route, Award, Code, CheckSquare, BarChart3, Users2 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

export default function FeatureCards() {
  const features = [
    {
      id: "interactive-lessons",
      title: "Interactive Bite-Sized Lessons",
      description:
        "Learn complex concepts in short, focused modules. Code side-by-side with industry experts with zero local setup needed.",
      badge: "01 / LEARN",
      bgColor: "bg-[#d5f5c2]", // Sticky Note Mint
      border: "border border-[#1a3300]",
      icon: BookOpenCheck,
      pillBg: "bg-[#1a3300] text-[#fcfaf5]",
      highlight: "Over 800+ hands-on lessons",
    },
    {
      id: "live-quizzes",
      title: "Live Quizzes & Code Challenges",
      description:
        "Test your retention immediately after each chapter with algorithmic puzzles, syntax drills, and multi-format quizzes.",
      badge: "02 / PRACTICE",
      bgColor: "bg-[#a8e5e5]", // Sticky Note Teal
      border: "border border-[#1a3300]",
      icon: Zap,
      pillBg: "bg-[#1a3300] text-[#fcfaf5]",
      highlight: "Instant test execution & feedback",
    },
    {
      id: "tailored-roadmaps",
      title: "Structured Skill Roadmaps",
      description:
        "No more tutorial hell. Follow guided career roadmaps curated by senior software engineers and technical leads.",
      badge: "03 / PROGRESS",
      bgColor: "bg-[#f6d0ff]", // Sticky Note Blush
      border: "border border-[#1a3300]",
      icon: Route,
      pillBg: "bg-[#1a3300] text-[#fcfaf5]",
      highlight: "Step-by-step milestones",
    },
    {
      id: "verified-certs",
      title: "Portfolio & Verified Certificates",
      description:
        "Build full-stack capstone projects and earn verifiable skill badges that you can share with hiring managers on LinkedIn.",
      badge: "04 / PROVE",
      bgColor: "bg-[#fcfaf5]", // Cream Paper
      border: "border-2 border-[#1a3300]",
      icon: Award,
      pillBg: "bg-[#ffe95c] text-[#1a3300] border border-[#1a3300]/20",
      highlight: "Cryptographically verified",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <FadeIn direction="up">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 pb-6 border-b border-[#b6b6b6]/40">
          <div>
            <div className="inline-block bg-[#ffe95c] px-3 py-0.5 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider">
              Why SkillPulse
            </div>
            <h2 
              className="text-[32px] sm:text-[44px] font-[800] text-[#1a3300] leading-tight tracking-[0.03em]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Built for how modern developers <span className="underline decoration-[#ffe95c] decoration-4 underline-offset-4">actually learn</span>.
            </h2>
          </div>
          <p className="text-[16px] text-[#1a3300]/80 max-w-[380px] font-normal">
            A learning system engineered to bridge the gap between theory and production-grade software delivery.
          </p>
        </div>
      </FadeIn>

      {/* Grid of Sticky Note Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <FadeIn key={item.id} direction="up" delay={idx * 100}>
              <div
                className={`${item.bgColor} ${item.border} rounded-[14px] p-7 sm:p-8 flex flex-col justify-between sticky-card shadow-[rgba(0,0,0,0.04)_0px_2px_4px] group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-[11px] font-mono px-2.5 py-1 rounded-[4px] font-semibold ${item.pillBg}`}>
                      {item.badge}
                    </span>
                    <div className="w-10 h-10 rounded-[8px] bg-[#1a3300]/10 flex items-center justify-center text-[#1a3300] group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-[22px] sm:text-[24px] font-bold text-[#1a3300] mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[16px] text-[#1a3300]/85 leading-[1.55] mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1a3300]/15 flex items-center justify-between text-[13px] font-mono text-[#1a3300]/80">
                  <span>{item.highlight}</span>
                  <span className="text-[#1a3300] font-bold group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
