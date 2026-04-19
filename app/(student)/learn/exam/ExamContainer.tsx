'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle,
  AlertCircle, Loader2, BookOpen, Volume2, PenLine,
  Send, Menu, X, AlertTriangle, Maximize, Minimize
} from 'lucide-react';

// ─── Timer Hook ────────────────────────────────────────────────────────────
function useTimer(initialSeconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return;
    }
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  const reset = (seconds: number) => {
    clearInterval(timerRef.current!);
    setRemaining(seconds);
  };

  return { remaining, reset };
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Module Icon ───────────────────────────────────────────────────────────
function ModuleIcon({ module }: { module: string }) {
  const icons: Record<string, React.ReactNode> = {
    listening: <Volume2 className="h-4 w-4" />,
    reading: <BookOpen className="h-4 w-4" />,
    writing: <PenLine className="h-4 w-4" />,
    speaking: <Volume2 className="h-4 w-4" />,
  };
  return <>{icons[module] || <BookOpen className="h-4 w-4" />}</>;
}

// ─── Question Renderer ─────────────────────────────────────────────────────
function QuestionRenderer({
  question,
  index,
  answer,
  isMarked,
  onAnswer,
  onMark,
}: {
  question: any;
  index: number;
  answer: any;
  isMarked: boolean;
  onAnswer: (value: any) => void;
  onMark: () => void;
}) {
  const type = question.questionType;
  const options = question.questionTypeData?.options || [];

  return (
    <motion.div
      key={question._id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shrink-0">
            {index + 1}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {type?.replace(/_/g, ' ')}
          </span>
        </div>
        <button
          onClick={onMark}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            isMarked
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-amber-50 hover:text-amber-600'
          }`}
        >
          <Flag className="h-3 w-3" />
          {isMarked ? 'Marked' : 'Mark for Review'}
        </button>
      </div>

      {/* Question Prompt */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5">
        <p className="text-slate-900 dark:text-white leading-relaxed text-base">
          {question.prompt?.text}
        </p>
      </div>

      {/* Answer Input Based on Type */}
      {type === 'multiple_choice_single' && options.length > 0 && (
        <div className="space-y-2">
          {options.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => onAnswer(opt)}
              className={`w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                answer === opt
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                answer === opt
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-300 dark:border-slate-600 text-slate-500'
              }`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className={`text-sm ${answer === opt ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                {opt}
              </span>
              {answer === opt && (
                <CheckCircle className="ml-auto h-5 w-5 text-blue-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {type === 'true_false_not_given' && (
        <div className="flex gap-3">
          {['True', 'False', 'Not Given'].map(opt => (
            <button
              key={opt}
              onClick={() => onAnswer(opt)}
              className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                answer === opt
                  ? opt === 'True' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : opt === 'False' ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                    : 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {(type === 'fill_in_blank' || type === 'short_answer' || type === 'matching') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Answer</label>
          <input
            type="text"
            value={answer || ''}
            onChange={e => onAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
          />
        </div>
      )}

      {type === 'essay' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Response</label>
            <span className="text-xs text-slate-400">
              {(answer || '').trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            value={answer?.essayText || ''}
            onChange={e => onAnswer({ essayText: e.target.value })}
            placeholder="Write your response here... (minimum 150 words for Task 1, 250 words for Task 2)"
            rows={12}
            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none leading-relaxed"
          />
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Exam Container ───────────────────────────────────────────────────
export function ExamContainer({ sessionId, moduleName }: { sessionId: string; moduleName: string }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [showNav, setShowNav] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['examModule', sessionId, moduleName],
    queryFn: async () => {
      const res = await api.get(`/api/test-sessions/${sessionId}/module/${moduleName}`);
      return res.data.data;
    },
  });

  const saveAnswerMutation = useMutation({
    mutationFn: async (payload: any) => {
      await api.post(`/api/test-sessions/${sessionId}/answer`, payload);
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/test-sessions/${sessionId}/submit`);
      return res.data;
    },
    onSuccess: (data) => {
      // Navigate to results page - use session id since result has the reference
      router.push(`/learn/results/${sessionId}`);
    },
  });

  const handleTimeExpire = useCallback(() => {
    submitMutation.mutate();
  }, []);

  const { remaining } = useTimer(
    data?.remainingTime?.remainingSeconds || (data?.section?.durationMinutes || 30) * 60,
    handleTimeExpire
  );

  const questions = data?.questions || [];
  const currentQuestion = questions[currentIndex];

  const handleAnswer = (value: any) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion._id]: value }));

    // Auto-save
    saveAnswerMutation.mutate({
      questionId: currentQuestion._id,
      questionNo: currentIndex + 1,
      answer: value,
      targetIndex: currentIndex,
    });
  };

  const toggleMark = () => {
    if (!currentQuestion) return;
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion._id)) next.delete(currentQuestion._id);
      else next.add(currentQuestion._id);
      return next;
    });
  };

  const getQuestionStatus = (q: any, idx: number) => {
    if (idx === currentIndex) return 'current';
    if (markedForReview.has(q._id)) return 'marked';
    if (answers[q._id] !== undefined) return 'answered';
    return 'unanswered';
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const progressPct = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  const urgentColor = remaining < 300 ? 'text-red-500' : remaining < 600 ? 'text-amber-500' : 'text-slate-900 dark:text-white';

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500">Loading exam questions...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <p className="text-slate-700 dark:text-slate-300">Failed to load exam module.</p>
          <button onClick={() => router.back()} className="text-blue-600 text-sm underline">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0a0f1c] overflow-hidden select-none">
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 bg-white dark:bg-[#0f1526] border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0 z-30">
        {/* Module info */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
            <ModuleIcon module={moduleName} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{moduleName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{data.section?.title}</p>
          </div>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 font-mono text-xl font-bold tabular-nums ${urgentColor} ${remaining < 300 ? 'animate-pulse' : ''}`}>
          <Clock className="h-5 w-5" />
          {formatTime(remaining)}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">{answeredCount}/{totalCount}</span>
          </div>

          {/* Nav toggle */}
          <button
            onClick={() => setShowNav(!showNav)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Menu className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Questions</span>
          </button>

          {/* Submit */}
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm shadow-blue-500/20"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Question Panel */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
            <AnimatePresence mode="wait">
              {currentQuestion ? (
                <QuestionRenderer
                  key={currentQuestion._id}
                  question={currentQuestion}
                  index={currentIndex}
                  answer={answers[currentQuestion._id]}
                  isMarked={markedForReview.has(currentQuestion._id)}
                  onAnswer={handleAnswer}
                  onMark={toggleMark}
                />
              ) : (
                <div className="text-center py-20 text-slate-400">No questions available.</div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* ── Question Navigation Drawer ── */}
        <AnimatePresence>
          {showNav && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 z-20 sm:hidden"
                onClick={() => setShowNav(false)}
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0f1526] border-l border-slate-200 dark:border-slate-800 z-30 overflow-y-auto shadow-xl sm:relative sm:shadow-none sm:w-72"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Question Navigator</h3>
                    <button onClick={() => setShowNav(false)} className="sm:hidden p-1 text-slate-400 hover:text-slate-700 rounded">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      { color: 'bg-blue-600', label: 'Current' },
                      { color: 'bg-emerald-500', label: 'Answered' },
                      { color: 'bg-amber-400', label: 'Marked' },
                      { color: 'bg-slate-200 dark:bg-slate-700', label: 'Unanswered' },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className={`h-3 w-3 rounded-full ${l.color}`} />
                        {l.label}
                      </div>
                    ))}
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q: any, idx: number) => {
                      const status = getQuestionStatus(q, idx);
                      const statusStyles: Record<string, string> = {
                        current: 'bg-blue-600 text-white ring-2 ring-blue-400 scale-110',
                        answered: 'bg-emerald-500 text-white',
                        marked: 'bg-amber-400 text-white',
                        unanswered: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
                      };
                      return (
                        <button
                          key={q._id}
                          onClick={() => { setCurrentIndex(idx); setShowNav(false); }}
                          className={`h-10 w-full rounded-lg text-xs font-bold transition-all ${statusStyles[status]}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Answered</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{answeredCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unanswered</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{totalCount - answeredCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marked</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{markedForReview.size}</span>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Navigation ── */}
      <footer className="flex items-center justify-between px-4 sm:px-8 py-3 bg-white dark:bg-[#0f1526] border-t border-slate-200 dark:border-slate-800 shrink-0 z-10">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <span className="text-sm text-slate-500 dark:text-slate-400">
          {currentIndex + 1} <span className="text-slate-400">/</span> {totalCount}
        </span>

        <button
          onClick={() => {
            if (currentIndex === totalCount - 1) {
              setShowSubmitConfirm(true);
            } else {
              setCurrentIndex(Math.min(totalCount - 1, currentIndex + 1));
            }
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-sm shadow-blue-500/20"
        >
          {currentIndex === totalCount - 1 ? 'Finish & Submit' : 'Next'}
          {currentIndex < totalCount - 1 && <ChevronRight className="h-4 w-4" />}
        </button>
      </footer>

      {/* ── Submit Confirmation Modal ── */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Submit {moduleName} Module?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Answered</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{answeredCount} / {totalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unanswered</span>
                  <span className={`font-semibold ${totalCount - answeredCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {totalCount - answeredCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Marked for Review</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{markedForReview.size}</span>
                </div>
              </div>

              {totalCount - answeredCount > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  You have {totalCount - answeredCount} unanswered question{totalCount - answeredCount > 1 ? 's' : ''}. These will count as incorrect.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {submitMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</> : <><Send className="h-4 w-4" />Submit Now</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
