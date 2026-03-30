'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ShieldAlert, Eye, AlertTriangle, CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';

export default function ReviewsPage() {
  const { data: flaggedSessions, isLoading, error } = useQuery({
    queryKey: ['adminReviews'],
    queryFn: async () => {
      const response = await api.get('/api/admin/review/flagged');
      return response.data;
    },
  });
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Session Security</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review flagged test sessions for potential cheating.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
           Failed to load reviews. {(error as any).message}
        </div>
      ) : (flaggedSessions?.length === 0) ? (
        <div className="text-center py-20 text-slate-500">
          No flagged sessions to review!
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {flaggedSessions?.map((session: any, index: number) => (
          <motion.div
            key={session._id || index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border ${
              session.riskLevel === 'high' 
                ? 'border-rose-200 dark:border-rose-900/50 shadow-rose-100 dark:shadow-rose-900/10' 
                : session.riskLevel === 'medium'
                ? 'border-amber-200 dark:border-amber-900/50 shadow-amber-100 dark:shadow-amber-900/10'
                : 'border-slate-200 dark:border-slate-800 shadow-slate-100 dark:shadow-slate-900/10'
            } p-6 shadow-md transition-all`}
          >
             {/* Header */}
             <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                   <div className={`p-2 rounded-lg ${
                     session.riskLevel === 'high' 
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                      : session.riskLevel === 'medium'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                   }`}>
                      {session.riskLevel === 'high' ? <AlertTriangle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                   </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
                        {session.userId?.name || session.studentName || 'Unknown Student'}
                      </h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                        {(session.userId?.firstName || session.userId?.surname) && (
                          <p className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-medium">
                            Official: {session.userId?.firstName} {session.userId?.surname}
                          </p>
                        )}
                        {session.userId?.passportNo && (
                          <p className="text-[10px] bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-medium">
                            Passport: {session.userId?.passportNo}
                          </p>
                        )}
                        {session.userId?.nationality && (
                          <p className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-400 font-medium">
                            {session.userId?.nationality}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{new Date(session.createdAt || session.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                   (session.riskLevel || 'low') === 'high' 
                    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400'
                    : (session.riskLevel || 'low') === 'medium'
                    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400'
                }`}>
                   {(session.riskLevel || 'low').toUpperCase()} RISK
                </span>
             </div>

             {/* Content */}
             <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-6">
                <p className="text-xs font-semibold text-slate-500 mb-1">REASON FLAGGED</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                   {session.reason || 'Multiple suspicious activities detected'}
                </p>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                   <FileText className="w-3.5 h-3.5" />
                   {session.testSessionId?.examTemplateId?.title || session.examTemplate || 'Test Session'}
                </p>
             </div>

             {/* Actions */}
             <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                <button className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1.5 transition-colors">
                   <Eye className="w-4 h-4" /> Full Logs
                </button>
                <div className="flex gap-2">
                   <button className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 transition-colors tooltip-trigger" title="Verify User">
                      <CheckCircle className="w-5 h-5" />
                   </button>
                   <button className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors tooltip-trigger" title="Invalidate Score">
                      <XCircle className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
}
