"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  FileText,
  ShieldAlert,
  CreditCard,
  LogOut,
  Users,
  UserCog,
  BookOpen,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navigation = [
  { 
    name: "Overview", 
    href: "/dashboard", 
    icon: LayoutDashboard,
    roles: ["platform_owner", "platform_admin", "org_owner", "org_admin", "org_teacher", "org_staff", "student"]
  },
  // ── Platform Admin Only ────────────────────
  {
    name: "Organizations",
    href: "/dashboard/organizations",
    icon: Building2,
    roles: ["platform_owner", "platform_admin"],
    section: "platform"
  },
  // ── Organization Users ─────────────────────
  {
    name: "My Organization",
    href: "/dashboard/my-organization",
    icon: Building2,
    roles: ["org_owner", "org_admin", "org_teacher", "org_staff"],
    section: "organization"
  },
  {
    name: "Members",
    href: "/dashboard/my-organization/members",
    icon: Users,
    roles: ["org_owner", "org_admin", "org_teacher"],
    section: "organization"
  },
  // ── Common Items ───────────────────────────
  { 
    name: "Exams", 
    href: "/dashboard/exams", 
    icon: FileText,
    roles: ["platform_owner", "platform_admin", "org_owner", "org_admin", "org_teacher", "student"]
  },
  { 
    name: "Reviews", 
    href: "/dashboard/reviews", 
    icon: ShieldAlert,
    roles: ["platform_owner", "platform_admin", "org_owner", "org_admin"]
  },
  {
    name: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: CreditCard,
    roles: ["platform_owner", "platform_admin", "org_owner", "student"]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userRole = ((session?.user as unknown) as { role?: string })?.role;

  // Filter navigation by role
  const filteredNavigation = navigation.filter(item => {
    if (isPending) return item.roles.includes("student");
    return !item.roles || (userRole && item.roles.includes(userRole));
  });

  // Group items by section for visual separation
  const platformItems = filteredNavigation.filter(i => i.section === "platform");
  const orgItems = filteredNavigation.filter(i => i.section === "organization");
  const commonItems = filteredNavigation.filter(i => !i.section);

  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await signOut();
      queryClient.clear();
      router.push("/login");
    } catch (e) {
      console.error(e);
      queryClient.clear();
      router.push("/login");
    }
  };

  const renderNavItem = (item: typeof navigation[0]) => {
    const isActive = pathname === item.href || 
      (item.href !== "/dashboard" && pathname.startsWith(item.href));
    return (
      <li key={item.name}>
        <Link
          href={item.href}
          className={`group relative flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200 ${
            isActive
              ? "bg-blue-50/80 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
          }`}
        >
          {isActive && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          <item.icon
            className={`h-5 w-5 shrink-0 ${
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
            }`}
            aria-hidden="true"
          />
          {item.name}
        </Link>
      </li>
    );
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-[#0f1526] border-r border-slate-200 dark:border-slate-800/60 shadow-sm transition-all">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-cyan-500 shadow-md shadow-blue-500/20 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Dream IELTS
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-1 flex-col overflow-y-auto pt-6 px-4 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {/* Common overview item */}
              {commonItems.filter(i => i.name === "Overview").map(renderNavItem)}
            </ul>
          </li>

          {/* Platform Section */}
          {platformItems.length > 0 && (
            <li>
              <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Platform
              </p>
              <ul role="list" className="-mx-2 space-y-1">
                {platformItems.map(renderNavItem)}
              </ul>
            </li>
          )}

          {/* Organization Section */}
          {orgItems.length > 0 && (
            <li>
              <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Organization
              </p>
              <ul role="list" className="-mx-2 space-y-1">
                {orgItems.map(renderNavItem)}
              </ul>
            </li>
          )}

          {/* Remaining Common Items */}
          {commonItems.filter(i => i.name !== "Overview").length > 0 && (
            <li>
              <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                General
              </p>
              <ul role="list" className="-mx-2 space-y-1">
                {commonItems.filter(i => i.name !== "Overview").map(renderNavItem)}
              </ul>
            </li>
          )}

          <li className="mt-auto -mx-2">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full flex justify-start gap-x-3 rounded-xl p-3 h-12 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 group"
            >
              <LogOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
              Sign Out
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
