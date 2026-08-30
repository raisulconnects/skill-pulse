import {
  LayoutDashboard,
  BookOpen,
  Compass,
  Trophy,
  GraduationCap,
  PlusCircle,
  FileText,
  Users,
  Layers,
  Settings,
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
    { name: "My Learning", href: "/dashboard/my-learning", icon: BookOpen },
    { name: "Browse Courses", href: "/dashboard/courses", icon: Compass },
  ],
  instructor: [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Courses", href: "/dashboard/my-courses", icon: BookOpen },
    { name: "Create Course", href: "/dashboard/courses/create", icon: PlusCircle },
  ],
  content_manager: [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Manage Courses", href: "/dashboard/manage-courses", icon: BookOpen },
    { name: "Create Course", href: "/dashboard/courses/create", icon: PlusCircle },
    { name: "Blog CMS", href: "/dashboard/blog", icon: FileText },
  ],
  admin: [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Admin Courses", href: "/dashboard/admin/courses", icon: BookOpen },
    { name: "Blog CMS", href: "/dashboard/blog", icon: FileText },
    { name: "User Management", href: "/dashboard/admin/users", icon: Users },
  ],
};
