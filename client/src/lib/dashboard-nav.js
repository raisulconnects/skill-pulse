import {
  LayoutDashboard,
  BookOpen,
  Compass,
  Trophy,
  GraduationCap,
  PlusCircle,
  FileText,
  HelpCircle,
  Users,
  Layers,
  Settings,
  BarChart3,
  CheckSquare,
  ShieldAlert,
} from "lucide-react";

export const ROLE_CONFIG = {
  student: {
    label: "Student",
    badgeBg: "bg-[#d5f5c2]",
    badgeText: "text-[#1a3300]",
    badgeBorder: "border-[#1a3300]/20",
    icon: GraduationCap,
    description: "Track your learning progress, complete lessons & build skills",
  },
  instructor: {
    label: "Instructor",
    badgeBg: "bg-[#ffe95c]",
    badgeText: "text-[#1a3300]",
    badgeBorder: "border-[#1a3300]/30",
    icon: PlusCircle,
    description: "Manage your courses, view student analytics & publish content",
  },
  content_manager: {
    label: "Content Manager",
    badgeBg: "bg-[#a8e5e5]",
    badgeText: "text-[#1a3300]",
    badgeBorder: "border-[#1a3300]/30",
    icon: Layers,
    description: "Review, curate & publish platform-wide learning resources",
  },
  admin: {
    label: "Administrator",
    badgeBg: "bg-[#f6d0ff]",
    badgeText: "text-[#1a3300]",
    badgeBorder: "border-[#1a3300]/30",
    icon: ShieldAlert,
    description: "Full platform overview, user management & system settings",
  },
};

export const DASHBOARD_NAV = {
  student: [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Learning", href: "#my-learning", icon: BookOpen, badge: "3 Active" },
    { name: "Browse Courses", href: "#browse", icon: Compass },
    { name: "Quiz Center", href: "#quizzes", icon: CheckSquare },
    { name: "Achievements", href: "#achievements", icon: Trophy },
  ],
  instructor: [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Courses", href: "#my-courses", icon: BookOpen, badge: "4 Live" },
    { name: "Create Course", href: "#create-course", icon: PlusCircle },
    { name: "Student Roster", href: "#students", icon: Users },
    { name: "Analytics", href: "#analytics", icon: BarChart3 },
  ],
  content_manager: [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Manage Courses", href: "#manage-courses", icon: BookOpen, badge: "12 Total" },
    { name: "Lesson Library", href: "#lessons", icon: FileText },
    { name: "Quiz Pool", href: "#quiz-pool", icon: HelpCircle },
    { name: "Content Audit", href: "#audit", icon: Layers },
  ],
  admin: [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "#users", icon: Users, badge: "4 Roles" },
    { name: "All Courses", href: "#courses", icon: BookOpen },
    { name: "Platform Stats", href: "#stats", icon: BarChart3 },
    { name: "System Settings", href: "#settings", icon: Settings },
  ],
};
