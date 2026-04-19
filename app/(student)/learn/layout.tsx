import { ReactNode } from "react";
import { BookOpen, User, Bell } from "lucide-react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Student Top Navigation */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <BookOpen size={18} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Dream IELTS</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="/learn" className="text-sm font-semibold text-blue-600 dark:text-blue-400">Dashboard</a>
            <a href="/learn/exam" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Exams</a>
            <a href="/learn/results" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Results</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <Bell size={18} />
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <User size={16} className="text-slate-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
