'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Award, Volume2, BookOpen, PenLine, Mic, Clock,
  BarChart3, ArrowLeft, RotateCcw, TrendingUp, Loader2, AlertCircle
} from 'lucide-react';

interface ResultsPageProps {
  params: Promise<{ sessionId: string }>;
}

const MODULE_ICONS: Record<string, any> = {
  listening: Volume2,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
};

const MODULE_COLORS: Record<string, string> = {
  listening: 'blue',
  reading: 'violet',
  writing: 'amber',
  speaking: 'emerald',
};

function BandCircle({ band, label }: { band: number; label: string }) {
  const pct = (band / 9) * 100;
  const color =
    band >= 7 ? '#10b981' :
    band >= 5 ? '#3b82f6' :
    band >= 3 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-200 dark:text-slate-700" />
          <circle
            cx="18" cy="18" r="15.9"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={`${pct} 100`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {band > 0 ? band.toFixed(1) : '–'}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">{label}</span>
    </div>
  );
}

function getBandDescription(band: number) {
  if (band >= 8) return { label: 'Expert', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
  if (band >= 7) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
  if (band >= 6) return { label: 'Competent', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' };
  if (band >= 5) return { label: 'Modest', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' };
  if (band >= 4) return { label: 'Limited', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' };
  return { label: 'Below Basic', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const { sessionId } = use(params);
  const router = useRouter();

  const { data: resultData, isLoading, error } = useQuery({
    queryKey: ['result', sessionId],
    queryFn: async () => {
      const res = await api.get(`/api/test-sessions/${sessionId}/result`);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-white dark:bg-slate-900 border border-red-200 p-8 rounded-2xl text-center shadow-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Result not found</h2>
          <p className="text-slate-500 mb-6">We couldn't find the result for this session.</p>
          <button onClick={() => router.push('/learn')} className="bg-blue-600 text-white px-6 py-2 rounded-xl">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const overallBand = resultData?.overallBand || 0;
  const scores = resultData?.moduleScores || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0a0f1c] dark:to-[#0a0f1c] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back Button */}
        <button
          onClick={() => router.push('/learn')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          {/* Gradient Banner */}
          <div className="h-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />

          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Big Score */}
              <div className="flex flex-col items-center">
                <div className="relative h-32 w-32">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30 flex items-center justify-center">
                    <div className="text-center text-white">
                      <p className="text-4xl font-black">{overallBand > 0 ? overallBand.toFixed(1) : '–'}</p>
                      <p className="text-xs font-medium opacity-80">Overall Band</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">Test Complete!</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  {resultData?.examTemplateId?.title || 'IELTS Mock Test'} · Accomplished on {new Date(resultData?.completedAt).toLocaleDateString()}
                </p>
                {overallBand > 0 && (() => {
                  const desc = getBandDescription(overallBand);
                  return (
                    <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${desc.bg} ${desc.color}`}>
                      {desc.label} User
                    </span>
                  );
                })()}
                {overallBand === 0 && (
                  <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Awaiting Score Processing
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Module Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Module Breakdown
          </h2>

          <div className="flex justify-around flex-wrap gap-6">
            <BandCircle band={scores.listening?.bandScore || 0} label="listening" />
            <BandCircle band={scores.reading?.bandScore || 0} label="reading" />
            <BandCircle band={scores.writing?.overallBand || 0} label="writing" />
            <BandCircle band={scores.speaking?.overallBand || 0} label="speaking" />
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Listening', score: scores.listening?.bandScore, raw: `${scores.listening?.rawScore || 0}/40`, module: 'listening' },
              { label: 'Reading', score: scores.reading?.bandScore, raw: `${scores.reading?.rawScore || 0}/40`, module: 'reading' },
              { label: 'Writing', score: scores.writing?.overallBand, raw: scores.writing?.overallBand > 0 ? 'Reviewed' : 'Awaiting Review', module: 'writing' },
              { label: 'Speaking', score: scores.speaking?.overallBand, raw: scores.speaking?.overallBand > 0 ? 'Reviewed' : 'Manual Entry', module: 'speaking' },
            ].map(m => {
              const IconComp = MODULE_ICONS[m.module];
              const color = MODULE_COLORS[m.module];
              return (
                <div key={m.module} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between group hover:border-blue-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-${color}-50 dark:bg-${color}-500/10`}>
                      <IconComp className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{m.label}</p>
                      <p className="text-xs text-slate-400">{m.raw}</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Band {m.score > 0 ? m.score.toFixed(1) : '–'}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Improvement Areas
          </h2>
          <div className="space-y-3">
            {overallBand < 6 ? [
              'Focus on reading comprehension speed and skimming techniques.',
              'Practice listening to various English accents and note-taking.',
              'Work on Academic Writing Task structure and vocabulary range.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-0.5">{i + 1}</span>
                {tip}
              </div>
            )) : [
              'Refine your writing to include more complex grammatical structures.',
              'Work on natural intonation and fluency in speaking.',
              'Practice under strict time conditions to maintain accuracy.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-0.5">{i + 1}</span>
                {tip}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 pb-12">
          <button
            onClick={() => router.push('/learn/exam')}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Take Another Test
          </button>
          <button
            onClick={() => router.push('/learn')}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white transition-colors shadow-md shadow-blue-500/20"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
