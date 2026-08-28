import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import FeatureCards from "@/components/home/FeatureCards";
import CourseShowcase from "@/components/home/CourseShowcase";
import RoadmapPreview from "@/components/home/RoadmapPreview";
import QuizPreview from "@/components/home/QuizPreview";
import Testimonials from "@/components/home/Testimonials";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf5] text-[#1a3300]">
      {/* Top Floating Pill Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1 flex flex-col">
        {/* Hero with Prism Background */}
        <HeroSection />

        {/* Core LMS Value Pillars / Sticky Note Cards */}
        <FeatureCards />

        {/* Featured Courses Catalog */}
        <CourseShowcase />

        {/* Structured Skill Roadmaps */}
        <RoadmapPreview />

        {/* Live Interactive Quiz Playground */}
        <QuizPreview />

        {/* Social Proof & Outcomes */}
        <Testimonials />

        {/* Final Conversion Banner */}
        <CtaBanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
