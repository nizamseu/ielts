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
  Settings,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    {
      name: "Organizations",
      href: "/dashboard/organizations",
      icon: Building2,
    },
    { name: "Exams", href: "/dashboard/exams", icon: FileText },
    { name: "Reviews", href: "/dashboard/reviews", icon: ShieldAlert },
    {
      name: "Subscriptions",
      href: "/dashboard/subscriptions",
      icon: CreditCard,
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (e) {
      console.error(e);
      // Fallback
      router.push("/login");
    }
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

      {/* Nav Link Layout */}
      <nav className="flex flex-1 flex-col overflow-y-auto pt-6 px-4 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
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
              })}
            </ul>
          </li>

          <li className="mt-auto -mx-2">
            <button
              onClick={handleLogout}
              className="group w-full flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <LogOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
              Sign Out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
