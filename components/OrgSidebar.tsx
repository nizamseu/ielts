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
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navigation = [
  { 
    name: "Dashboard", 
    href: "/organization", 
    icon: LayoutDashboard,
    roles: ["platform_owner", "platform_admin", "org_owner", "org_admin", "org_teacher", "org_staff"]
  },
  {
    name: "Members",
    href: "/organization/members",
    icon: Users,
    roles: ["org_owner", "org_admin", "org_teacher"],
  },
  {
    name: "Students",
    href: "/organization/students",
    icon: GraduationCap,
    roles: ["platform_owner", "platform_admin", "org_owner", "org_admin", "org_teacher"],
  },
  { 
    name: "Exams", 
    href: "/admin/exams", 
    icon: FileText,
    roles: ["platform_owner", "platform_admin", "org_owner", "org_admin", "org_teacher", "student"]
  },
  { 
    name: "Reviews", 
    href: "/admin/reviews", 
    icon: ShieldAlert,
    roles: ["platform_owner", "platform_admin", "org_owner", "org_admin"]
  },
  {
    name: "Subscriptions",
    href: "/admin/subscriptions",
    icon: CreditCard,
    roles: ["platform_owner", "platform_admin", "org_owner", "student"]
  },
];

export function OrgSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userRole = ((session?.user as unknown) as { role?: string })?.role;

  // Filter navigation by role
  const filteredNavigation = navigation.filter(item => {
    if (isPending) return item.roles.includes("student");
    return !item.roles || (userRole && item.roles.includes(userRole));
  });

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

  const isPlatformAdmin = userRole === "platform_owner" || userRole === "platform_admin";

  // Find the most specific matching navigation item for the current path
  const activeNavItem = filteredNavigation
    .filter(nav => pathname === nav.href || pathname.startsWith(`${nav.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const renderNavItem = (item: typeof navigation[0]) => {
    const isActive = activeNavItem 
      ? activeNavItem.name === item.name 
      : pathname === item.href;

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
              layoutId="org-sidebar-active-indicator"
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
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              Dream IELTS
            </span>
            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-0.5">
              Organization
            </span>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-1 flex-col overflow-y-auto pt-6 px-4 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map(renderNavItem)}
            </ul>
          </li>

          {isPlatformAdmin && (
            <li>
              <div className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Platform
              </div>
              <ul role="list" className="-mx-2 space-y-1">
                <li>
                  <Link
                    href="/admin"
                    className="group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200 transition-all duration-200"
                  >
                    <ArrowLeft className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                    Back to Admin
                  </Link>
                </li>
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
