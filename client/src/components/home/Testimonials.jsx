import { Star, Quote } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      quote:
        "SkillPulse completely changed how I prepare for systems design and full-stack roles. The interactive quizzes after each concept make the knowledge actually stick.",
      author: "Alex Morgan",
      role: "Senior Frontend Engineer @ Cloudflare",
      bg: "bg-[#fcfaf5]",
      border: "border-2 border-[#1a3300]",
      badge: "Full-Stack Path Graduate",
      badgeColor: "bg-[#d5f5c2]",
    },
    {
      id: 2,
      quote:
        "The AI Agent course was the first tutorial that didn't just rehash docs. We built real production-grade tool-calling loops with state persistence.",
      author: "Devon Reed",
      role: "AI Tech Lead @ Autonomous",
      bg: "bg-[#d5f5c2]",
      border: "border border-[#1a3300]",
      badge: "AI Engineering Path",
      badgeColor: "bg-[#1a3300] text-[#fcfaf5]",
    },
    {
      id: 3,
      quote:
        "Our entire engineering cohort uses SkillPulse for onboarding junior developers. The structured roadmaps save our senior staff hundreds of mentoring hours.",
      author: "Maya Patel",
      role: "VP of Engineering @ Fintech Labs",
      bg: "bg-[#f6d0ff]",
      border: "border border-[#1a3300]",
      badge: "Enterprise Team Lead",
      badgeColor: "bg-[#1a3300] text-[#fcfaf5]",
    },
  ];

  return (
    <section id="community" className="py-16 md:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <FadeIn direction="up">
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <div className="inline-block bg-[#ffe95c] px-3 py-0.5 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider">
            Learner Outcomes
          </div>
          <h2
            className="text-[32px] sm:text-[44px] font-[800] text-[#1a3300] leading-tight tracking-[0.03em] mb-4"
            style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
          >
            Built for builders who value <span className="marker-highlight">real mastery</span>.
          </h2>
          <p className="text-[16px] text-[#1a3300]/80">
            Hear from software engineers, tech leads, and career switchers who accelerated their careers with SkillPulse.
          </p>
        </div>
      </FadeIn>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {reviews.map((rev, idx) => (
          <FadeIn key={rev.id} direction="up" delay={idx * 120}>
            <div
              className={`${rev.bg} ${rev.border} rounded-[14px] p-7 flex flex-col justify-between sticky-card shadow-[rgba(0,0,0,0.04)_0px_2px_4px] group`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-[4px] ${rev.badgeColor}`}>
                    {rev.badge}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#1a3300] text-[#1a3300]" />
                    ))}
                  </div>
                </div>

                <p className="text-[15px] text-[#1a3300] leading-relaxed mb-6 font-normal">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#1a3300]/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1a3300] text-[#fcfaf5] flex items-center justify-center font-bold text-[12px] group-hover:scale-110 transition-transform duration-300">
                  {rev.author[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#1a3300] leading-tight">
                    {rev.author}
                  </span>
                  <span className="text-[11px] text-[#1a3300]/70 leading-tight mt-0.5">
                    {rev.role}
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
