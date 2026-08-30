"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Compass, ShieldCheck, Terminal, Flame } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

export default function RoadmapPreview() {
  const [activeTrack, setActiveTrack] = useState(0);

  const tracks = [
    {
      id: "fullstack",
      title: "Senior Full-Stack Engineer",
      duration: "6 Months • 12 Milestones",
      description:
        "Master the complete stack from modern React/Next.js architectures to backend Node/PostgreSQL, distributed microservices, and CI/CD pipelines.",
      badgeColor: "bg-[#d5f5c2]",
      steps: [
        {
          title: "Modern JavaScript & TypeScript Patterns",
          status: "Completed",
          tag: "Stage 1",
          skills: ["Closures", "Async/Await", "Generics", "Type Systems"],
        },
        {
          title: "Production React & Next.js App Router",
          status: "In Progress",
          tag: "Stage 2",
          skills: ["Server Components", "Streaming", "State Machines", "SEO"],
        },
        {
          title: "Scalable Backend, Databases & Auth",
          status: "Upcoming",
          tag: "Stage 3",
          skills: ["Strapi CMS", "PostgreSQL", "OAuth2", "Connection Pooling"],
        },
        {
          title: "Cloud Deployment, Observability & Capstone",
          status: "Upcoming",
          tag: "Stage 4",
          skills: ["Docker", "Kubernetes", "Redis", "Distributed Tracing"],
        },
      ],
    },
    {
      id: "ai-engineer",
      title: "Production AI & LLM Engineer",
      duration: "4 Months • 8 Milestones",
      description:
        "Build reliable LLM-powered applications, multi-agent frameworks, semantic search pipelines, and automated agentic workflows.",
      badgeColor: "bg-[#a8e5e5]",
      steps: [
        {
          title: "Vector Embeddings & RAG Architectures",
          status: "Completed",
          tag: "Stage 1",
          skills: ["Chunking", "pgvector", "Hybrid Search", "Reranking"],
        },
        {
          title: "Autonomous Agents & Tool Calling",
          status: "Upcoming",
          tag: "Stage 2",
          skills: ["LangGraph", "Function Calling", "Memory Buffers", "HITL"],
        },
        {
          title: "Fine-Tuning, Quantization & Evaluation",
          status: "Upcoming",
          tag: "Stage 3",
          skills: ["LoRA/QLoRA", "RAG Triad", "LLM-as-a-Judge", "Latency"],
        },
      ],
    },
    {
      id: "system-design",
      title: "High-Scale Systems Architect",
      duration: "5 Months • 10 Milestones",
      description:
        "Architect enterprise systems handling millions of concurrent queries with rock-solid consistency, caching, and resiliency.",
      badgeColor: "bg-[#f6d0ff]",
      steps: [
        {
          title: "Networking, Protocols & Load Balancing",
          status: "Completed",
          tag: "Stage 1",
          skills: ["HTTP/3", "gRPC", "Consistent Hashing", "Rate Limiting"],
        },
        {
          title: "Distributed Caching & Message Brokers",
          status: "Upcoming",
          tag: "Stage 2",
          skills: ["Redis Clusters", "Kafka", "Eventual Consistency", "CQRS"],
        },
        {
          title: "Database Sharding & Disaster Recovery",
          status: "Upcoming",
          tag: "Stage 3",
          skills: ["Replication", "Partitioning", "2PC", "Chaos Engineering"],
        },
      ],
    },
  ];

  const currentTrack = tracks[activeTrack];

  return (
    <section id="paths" className="py-16 md:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <FadeIn direction="up">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-block bg-[#ffe95c] px-3 py-0.5 rounded-[4px] text-[12px] font-mono font-medium text-[#1a3300] mb-3 uppercase tracking-wider">
              Structured Paths
            </div>
            <h2
              className="text-[32px] sm:text-[44px] font-[800] text-[#1a3300] leading-tight tracking-[0.03em]"
              style={{ fontFamily: "var(--font-bricolage-grotesque), var(--font-bricolage), sans-serif" }}
            >
              Clear <span className="marker-highlight">Skill Roadmaps</span>, zero guesswork.
            </h2>
          </div>
          <p className="text-[16px] text-[#1a3300]/80 max-w-[400px]">
            Follow step-by-step career tracks that guide you from beginner concepts to senior engineer capstones.
          </p>
        </div>
      </FadeIn>

      {/* Track Selection Tabs */}
      <FadeIn direction="up" delay={100}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tracks.map((track, idx) => {
            const isSelected = activeTrack === idx;
            return (
              <button
                key={track.id}
                onClick={() => setActiveTrack(idx)}
                className={`text-left p-5 rounded-[12px] border transition-all btn-interactive ${isSelected
                  ? "bg-[#1a3300] text-[#fcfaf5] border-[#1a3300] shadow-md"
                  : "bg-[#fcfaf5] text-[#1a3300] border-[#b6b6b6]/70 hover:border-[#1a3300]"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-[4px] ${isSelected
                      ? "bg-[#ffe95c] text-[#1a3300]"
                      : `${track.badgeColor} text-[#1a3300]`
                      }`}
                  >
                    Track 0{idx + 1}
                  </span>
                  {isSelected && <Flame className="w-4 h-4 text-[#ffe95c] animate-pulse-subtle" />}
                </div>
                <h3 className="text-[17px] font-bold tracking-tight mb-1">{track.title}</h3>
                <p
                  className={`text-[12px] font-mono ${isSelected ? "text-[#fcfaf5]/70" : "text-[#1a3300]/60"
                    }`}
                >
                  {track.duration}
                </p>
              </button>
            );
          })}
        </div>
      </FadeIn>

      {/* Active Roadmap Detailed Display */}
      <FadeIn direction="up" delay={200}>
        <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] p-6 sm:p-10 shadow-sm animate-scale-in">
          <div className="max-w-[720px] mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-5 h-5 text-[#1a3300]" />
              <h3 className="text-[24px] font-bold text-[#1a3300]">{currentTrack.title}</h3>
            </div>
            <p className="text-[15px] text-[#1a3300]/80 leading-relaxed">
              {currentTrack.description}
            </p>
          </div>

          {/* Milestone Steps Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {currentTrack.steps.map((step, i) => (
              <div
                key={i}
                className="bg-[#fcfaf5] border border-[#1a3300]/40 rounded-[10px] p-4 flex flex-col justify-between card-hover-lift"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-semibold bg-[#1a3300]/10 text-[#1a3300] px-2 py-0.5 rounded-[4px]">
                      {step.tag}
                    </span>
                    {step.status === "Completed" && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-[#1a3300] font-bold">
                        <Check className="w-3.5 h-3.5" /> Done
                      </span>
                    )}
                  </div>
                  <h4 className="text-[15px] font-bold text-[#1a3300] mb-3 leading-snug">
                    {step.title}
                  </h4>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#b6b6b6]/30">
                    {step.skills.map((skill, skIdx) => (
                      <span
                        key={skIdx}
                        className="text-[10px] font-mono bg-[#1a3300]/5 text-[#1a3300] px-1.5 py-0.5 rounded-[3px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#b6b6b6]/40">
            <div className="flex items-center gap-2 text-[13px] font-mono text-[#1a3300]/80">
              <ShieldCheck className="w-4 h-4 text-[#1a3300]" />
              <span>Includes 1-on-1 milestone reviews & capstone grading</span>
            </div>
            <Link
              href="https://roadmap.sh/"
              className="btn-interactive inline-flex items-center gap-2 bg-[#1a3300] text-[#fcfaf5] text-[14px] font-medium px-5 py-2.5 rounded-[6px] hover:bg-[#1a3300]/95 group"
            >
              <span>Start This Skill Path</span>
              <ArrowRight className="w-4 h-4 text-[#ffe95c] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
