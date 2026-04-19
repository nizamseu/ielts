'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X, Plus, Trash2, Loader2, FileText, Clock, BookOpen } from 'lucide-react';

interface Section {
  module: string;
  title: string;
  order: number;
  durationMinutes: number;
}

interface CreateExamModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const IELTS_MODULES = [
  { value: 'listening', label: 'Listening', duration: 30, color: 'blue' },
  { value: 'reading', label: 'Reading', duration: 60, color: 'violet' },
  { value: 'writing', label: 'Writing', duration: 60, color: 'amber' },
  { value: 'speaking', label: 'Speaking', duration: 15, color: 'emerald' },
];

export function CreateExamModal({ onClose, onCreated }: CreateExamModalProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<'academic' | 'general_training'>('academic');
  const [sections, setSections] = useState<Section[]>([]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const totalDuration = sections.reduce((acc, s) => acc + s.durationMinutes, 0);
      const res = await api.post('/api/exam-templates', {
        title,
        examType,
        durationMinutes: totalDuration,
        sections,
      });
      return res.data;
    },
    onSuccess: () => {
      onCreated();
    },
  });

  const addSection = (module: typeof IELTS_MODULES[0]) => {
    const exists = sections.find(s => s.module === module.value);
    if (exists) return;
    setSections(prev => [
      ...prev,
      {
        module: module.value,
        title: `${module.label} Section`,
        order: prev.length + 1,
        durationMinutes: module.duration,
      },
    ]);
  };

  const removeSection = (module: string) => {
    setSections(prev => prev.filter(s => s.module !== module));
  };

  const updateSection = (module: string, field: keyof Section, value: any) => {
    setSections(prev =>
      prev.map(s => (s.module === module ? { ...s, [field]: value } : s))
    );
  };

  const totalDuration = sections.reduce((acc, s) => acc + s.durationMinutes, 0);
  const canProceed = step === 1 ? title.trim().length > 0 : sections.length > 0;

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
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Create Exam Template</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Step {step} of 2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {[1, 2].map(s => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Exam Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="exam-title-input"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., IELTS Academic Full Test 2024"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Exam Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: 'academic', label: 'Academic', desc: 'For university applications' },
                    { value: 'general_training', label: 'General Training', desc: 'For work & migration' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      id={`exam-type-${opt.value}`}
                      type="button"
                      onClick={() => setExamType(opt.value)}
                      className={`flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all ${
                        examType === opt.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span className="font-medium text-sm text-slate-900 dark:text-white">{opt.label}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Add Modules <span className="text-slate-400 font-normal">(click to add/remove)</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {IELTS_MODULES.map(mod => {
                    const added = sections.some(s => s.module === mod.value);
                    return (
                      <button
                        key={mod.value}
                        id={`add-module-${mod.value}`}
                        type="button"
                        onClick={() => added ? removeSection(mod.value) : addSection(mod)}
                        className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                          added
                            ? `border-${mod.color}-500 bg-${mod.color}-50 dark:bg-${mod.color}-500/10`
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold uppercase ${
                          added ? `bg-${mod.color}-600 text-white` : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {mod.label.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{mod.label}</p>
                          <p className="text-xs text-slate-500">{mod.duration} min</p>
                        </div>
                        {added && (
                          <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                            <span className="text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section config */}
              {sections.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Configure Sections</p>
                  {sections.map(sec => (
                    <div key={sec.module} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold capitalize text-slate-900 dark:text-white">{sec.module}</span>
                        <button
                          onClick={() => removeSection(sec.module)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Section Title</label>
                          <input
                            type="text"
                            value={sec.title}
                            onChange={e => updateSection(sec.module, 'title', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Duration (minutes)</label>
                          <input
                            type="number"
                            value={sec.durationMinutes}
                            min={1}
                            onChange={e => updateSection(sec.module, 'durationMinutes', parseInt(e.target.value) || 0)}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    Total duration: <span className="font-semibold text-slate-900 dark:text-white">{totalDuration} minutes</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={() => step === 1 ? onClose() : setStep(1)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step === 1 ? (
            <button
              id="next-step-btn"
              onClick={() => setStep(2)}
              disabled={!canProceed}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 text-sm font-semibold text-white transition-colors"
            >
              Next: Add Sections →
            </button>
          ) : (
            <button
              id="create-exam-submit-btn"
              onClick={() => createMutation.mutate()}
              disabled={!canProceed || createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 text-sm font-semibold text-white transition-colors"
            >
              {createMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Creating...</>
              ) : 'Create Exam Template'}
            </button>
          )}
        </div>

        {createMutation.isError && (
          <div className="px-6 pb-4 text-sm text-red-600 dark:text-red-400">
            Failed to create exam. Please try again.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
