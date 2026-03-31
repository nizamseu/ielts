"use client";

import { motion } from "framer-motion";
import { BookOpen, Star, Clock, Trophy } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back, Student
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ready to continue your IELTS preparation journey?
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tests Completed", value: "0", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Overall Score", value: "N/A", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Hours Practiced", value: "0h", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Achievements", value: "0", icon: Trophy, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${stat.bg} ${stat.color} dark:bg-opacity-10`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
        {/* Next Exam */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Upcoming Exams</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            You don&apos;t have any mock tests scheduled currently. Browse the library to start a new practice test.
          </p>
          <button className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
            Browse Exams
          </button>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <Clock size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">Your practice history will appear here once you take a test.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
