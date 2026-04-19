'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  FileText, Clock, BookOpen, Volume2, PenLine, Mic,
  Play, ChevronRight, Loader2, AlertCircle, Award, Layers, X, CheckCircle
} from 'lucide-react';

const MODULE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  listening: { icon: Volume2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  reading: { icon: BookOpen, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  writing: { icon: PenLine, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  speaking: { icon: Mic, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
};

function ExamCard({ exam, onStart }: { exam: any; onStart: (exam: any) => void }) {
  const sections = exam.sectionIds || [];
  const totalQuestions = sections.reduce((acc: number, s: any) => acc + (s.questionIds?.length || 0), 0);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{exam.title}</h3>
              <span className={`inline-flex items-center mt-0.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                exam.examType === 'academic'
                  ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20'
                  : 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20'
              }`}>
                {exam.examType === 'academic' ? 'Academic' : 'General Training'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="px-5 py-4">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Included Modules</p>
        <div className="grid grid-cols-2 gap-2">
          {sections.map((sec: any) => {
            const config = MODULE_CONFIG[sec.module] || MODULE_CONFIG.reading;
            const IconComp = config.icon;
            return (
              <div key={sec._id} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${config.bg}`}>
                <IconComp className={`h-4 w-4 shrink-0 ${config.color}`} />
                <div>
                  <p className={`text-xs font-medium capitalize ${config.color}`}>{sec.module}</p>
                  <p className="text-xs text-slate-500">{sec.durationMinutes}m · {sec.questionIds?.length || 0}q</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {exam.durationMinutes || sections.reduce((a: number, s: any) => a + s.durationMinutes, 0)} min
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {totalQuestions} questions
          </span>
        </div>
        <button
          id={`start-exam-${exam._id}`}
          onClick={() => onStart(exam)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm shadow-blue-500/20"
        >
          <Play className="h-3.5 w-3.5" />
          Start Test
        </button>
      </div>
    </motion.div>
  );
}

function StartExamModal({ exam, onClose, onStarted }: { exam: any; onClose: () => void; onStarted: (session: any) => void }) {
  const router = useRouter();

  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/test-sessions/start', {
        examTemplateId: exam._id,
      });
      return res.data.data;
    },
    onSuccess: (session) => {
      onStarted(session);
    },
  });

  const sections = exam.sectionIds || [];
  const firstSection = sections.sort((a: any, b: any) => a.order - b.order)[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Ready to Start?</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Exam summary */}
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 mx-auto mb-3">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{exam.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize mt-0.5">{exam.examType?.replace('_', ' ')} IELTS</p>
          </div>

          {/* Instructions */}
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 space-y-2">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Before you begin:</p>
            <ul className="space-y-1.5">
              {[
                'Ensure you have a quiet environment',
                'Do not switch tabs during the exam',
                'The timer starts immediately upon clicking Start',
                'Your answers are auto-saved',
                'You cannot pause once started',
              ].map((tip, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Module preview */}
          <div className="space-y-2">
            {sections.sort((a: any, b: any) => a.order - b.order).map((sec: any, i: number) => {
              const config = MODULE_CONFIG[sec.module] || MODULE_CONFIG.reading;
              const IconComp = config.icon;
              return (
                <div key={sec._id} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500">{i + 1}</span>
                  <IconComp className={`h-4 w-4 shrink-0 ${config.color}`} />
                  <span className="capitalize text-slate-700 dark:text-slate-300">{sec.module}</span>
                  <span className="ml-auto text-xs text-slate-400">{sec.durationMinutes} min</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-start-exam-btn"
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 py-2.5 text-sm font-semibold text-white transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {startMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Starting...</>
            ) : (
              <><Play className="h-4 w-4" />Start Exam Now</>
            )}
          </button>
        </div>

        {startMutation.isError && (
          <div className="px-6 pb-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            {(startMutation.error as any)?.response?.data?.message || 'Failed to start. Check your subscription.'}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function ExamListPage() {
  const router = useRouter();
  const [selectedExam, setSelectedExam] = useState<any>(null);

  const { data: exams, isLoading, error } = useQuery({
    queryKey: ['publishedExams'],
    queryFn: async () => {
      const res = await api.get('/api/exam-templates');
      // Filter only published exams for students
      return res.data.filter((e: any) => e.published);
    },
  });

  const handleStarted = (session: any) => {
    setSelectedExam(null);
    const firstModule = session.currentModule;
    if (firstModule) {
      router.push(`/exam/${session._id}/${firstModule}`);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Practice Exams
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose a full IELTS mock test to practice your skills.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-6 text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          Failed to load exams. {(error as any).message}
        </div>
      ) : !exams?.length ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
          <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Exams Available</h3>
          <p className="text-slate-500 dark:text-slate-400">No published exams are available yet. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {exams.map((exam: any, i: number) => (
            <motion.div
              key={exam._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <ExamCard exam={exam} onStart={setSelectedExam} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Start Modal */}
      <AnimatePresence>
        {selectedExam && (
          <StartExamModal
            exam={selectedExam}
            onClose={() => setSelectedExam(null)}
            onStarted={handleStarted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
