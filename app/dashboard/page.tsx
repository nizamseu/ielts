'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users, BookOpen, Activity, Loader2, Building2 } from 'lucide-react';

export default function DashboardOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await api.get('/api/admin/dashboard');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
        <p className="font-semibold">Failed to load dashboard statistics.</p>
        <p className="text-sm mt-2 opacity-80 text-red-500">{(error as any).message}</p>
      </div>
    );
  }

  const metrics = data?.stats || {};
  const usage = data?.usage || {};

  const stats = [
    { name: 'Active Users', value: metrics.totalUsers?.toLocaleString() || '0', change: '', icon: Users },
    { name: 'Total Organizations', value: metrics.totalOrganizations?.toLocaleString() || '0', change: '', icon: Building2 },
    { name: 'Exams Created', value: metrics.totalExamTemplates?.toLocaleString() || '0', change: '', icon: BookOpen },
    { name: 'Flagged Sessions', value: usage.flaggedSessionsCount?.toLocaleString() || '0', change: '', icon: Activity },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Overview</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">High level overview of your Dream IELTS platform metrics.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-blue-600 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                  {stat.change && (
                     <span className={`text-sm font-medium ${
                       stat.change.startsWith('+') ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                     }`}>
                       {stat.change}
                     </span>
                  )}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart / Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[400px] flex items-center justify-center">
            <p className="text-slate-400 dark:text-slate-500 text-sm flex items-center gap-2">
               <Activity className="h-4 w-4" /> Usage Chart Placeholder
            </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[400px]">
           <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Recent Flagged Sessions</h3>
           <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                   <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Session ID #{4392 + i}</span>
                      <span className="text-xs text-rose-500 dark:text-rose-400">Multiple Tab Switches</span>
                   </div>
                   <span className="text-xs text-slate-500">{i * 2} min ago</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
