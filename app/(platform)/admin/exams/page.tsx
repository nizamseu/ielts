'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { FileText, Clock, Plus, Edit3, Trash2, Loader2 } from 'lucide-react';

export default function ExamsPage() {
  const { data: exams, isLoading, error } = useQuery({
    queryKey: ['adminExams'],
    queryFn: async () => {
      const response = await api.get('/api/exam-templates');
      return response.data;
    },
  });
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Exam Templates</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create and manage test structures for your students.</p>
        </div>
        <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/20 px-4 py-2.5 text-sm font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          Create Template
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
           Failed to load exams. {(error as any).message}
        </div>
      ) : (exams?.length === 0) ? (
        <div className="text-center py-20 text-slate-500">
          No exam templates created yet.
        </div>
      ) : (
        <div className="overflow-hidden bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Template Title</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Duration</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th scope="col" className="relative py-4 pl-3 pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {exams?.map((exam: any, i: number) => (
                <motion.tr 
                   key={exam._id || i}
                   initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.05 }}
                 className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                     <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{exam.title}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{exam.sectionIds?.length || exam.modules || 0} Modules included</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                     exam.examType === 'academic' 
                      ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20' 
                      : 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20'
                  }`}>
                    {exam.examType ? (exam.examType.charAt(0).toUpperCase() + exam.examType.slice(1)) : 'Unknown'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">
                   <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {exam.durationMinutes} mins
                   </div>
                </td>
                <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500">
                  {exam.published ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                       <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                       Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                       <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                       Draft
                    </span>
                  )}
                </td>
                <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right text-sm font-medium">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-lg transition-colors">
                        <Edit3 className="h-4 w-4" />
                     </button>
                     <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
