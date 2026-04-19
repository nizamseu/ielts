'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  FileText, Clock, Plus, Edit3, Trash2, Loader2,
  BookOpen, ChevronRight, Eye, ToggleLeft, ToggleRight,
  BarChart3, Users, CheckCircle, XCircle, Layers
} from 'lucide-react';
import { CreateExamModal } from './CreateExamModal';
import { ExamDetailModal } from './ExamDetailModal';

export default function ExamsPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  const { data: exams, isLoading, error } = useQuery({
    queryKey: ['adminExams'],
    queryFn: async () => {
      const response = await api.get('/api/exam-templates');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/exam-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminExams'] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const res = await api.patch(`/api/exam-templates/${id}/publish`, { published });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminExams'] });
    },
  });

  const totalExams = exams?.length || 0;
  const publishedExams = exams?.filter((e: any) => e.published).length || 0;
  const totalSections = exams?.reduce((acc: number, e: any) => acc + (e.sectionIds?.length || 0), 0) || 0;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Exam Templates
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Build and manage IELTS exam structures for your students.
          </p>
        </div>
        <button
          id="create-exam-btn"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/20 px-4 py-2.5 text-sm font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Create Exam Template
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Exams', value: totalExams, icon: FileText, color: 'blue' },
          { label: 'Published', value: publishedExams, icon: CheckCircle, color: 'emerald' },
          { label: 'Total Sections', value: totalSections, icon: Layers, color: 'violet' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 text-red-600 dark:text-red-400">
          Failed to load exams. {(error as any).message}
        </div>
      ) : !exams?.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700"
        >
          <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Exam Templates Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first IELTS exam template to get started.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create First Exam
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {exams.map((exam: any, i: number) => (
            <motion.div
              key={exam._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="flex items-center gap-4 p-5">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                  <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">{exam.title}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          exam.examType === 'academic'
                            ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20'
                            : 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20'
                        }`}>
                          {exam.examType === 'academic' ? 'Academic' : 'General Training'}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          {exam.durationMinutes || 'N/A'} mins
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <BookOpen className="h-3.5 w-3.5" />
                          {exam.sectionIds?.length || 0} sections
                        </span>
                        {/* Section modules preview */}
                        {exam.sectionIds?.slice(0, 4).map((sec: any) => (
                          <span key={sec._id} className="inline-flex items-center rounded px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                            {sec.module}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      {exam.published ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-sm">
                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    id={`view-exam-${exam._id}`}
                    onClick={() => setSelectedExam(exam)}
                    title="View & Edit Sections"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    id={`toggle-publish-${exam._id}`}
                    onClick={() => publishMutation.mutate({ id: exam._id, published: !exam.published })}
                    title={exam.published ? 'Unpublish' : 'Publish'}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 rounded-lg transition-colors"
                  >
                    {exam.published ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </button>
                  <button
                    id={`delete-exam-${exam._id}`}
                    onClick={() => {
                      if (confirm(`Delete "${exam.title}"? This cannot be undone.`)) {
                        deleteMutation.mutate(exam._id);
                      }
                    }}
                    title="Delete"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    id={`expand-exam-${exam._id}`}
                    onClick={() => setSelectedExam(exam)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateExamModal
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false);
              queryClient.invalidateQueries({ queryKey: ['adminExams'] });
            }}
          />
        )}
        {selectedExam && (
          <ExamDetailModal
            exam={selectedExam}
            onClose={() => setSelectedExam(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
