'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import {
  GraduationCap,
  Search,
  Loader2,
  Users,
  Mail,
  Phone,
  Globe,
  ShieldCheck,
  ArrowRight,
  Calendar,
  UserCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function StudentsPage() {
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role || 'student';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ['orgStudents', searchQuery, statusFilter, currentPage],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        role: 'student',
        page: currentPage,
        limit,
      };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/api/organizations/members', { params });
      return response.data;
    },
  });

  const students = data?.data?.members || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Students
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {total} student{total !== 1 ? 's' : ''} in your organization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl h-11 text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                statusFilter === status
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Students Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="text-sm text-slate-400 font-medium">Loading students...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-500/5 dark:border-red-500/20 p-8 text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold">Failed to load students</p>
          <p className="text-sm text-red-500/70 mt-2">
            {(error as any)?.response?.data?.message || (error as any)?.message}
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No students found</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'No students have been added to your organization yet. Add members with the student role to see them here.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Contact & Identity</th>
                    <th className="px-6 py-4 hidden md:table-cell">Joined</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {students.map((student: any, i: number) => (
                    <motion.tr 
                      key={student._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link href={`/organization/students/${student._id}`} className="shrink-0">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-colors">
                              {student.image ? (
                                <img src={student.image} alt={student.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                                  {student.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              )}
                            </div>
                          </Link>
                          <div className="min-w-0">
                            <Link href={`/organization/students/${student._id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              <p className="font-semibold text-slate-900 dark:text-white truncate">{student.name}</p>
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{student.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Identity */}
                      <td className="px-6 py-4 hidden sm:table-cell align-top space-y-2">
                        {student.phone ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-1">
                            <Phone className="h-3 w-3" />
                            {student.phone}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic mt-1 block">No phone provided</span>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {student.passportNo && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 text-[10px] font-medium border border-blue-100 dark:border-blue-500/20">
                              <ShieldCheck size={10} /> {student.passportNo}
                            </span>
                          )}
                          {student.nationality && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                              <Globe size={10} /> {student.nationality}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 hidden md:table-cell align-top text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 mt-1">
                          <Calendar size={12} className="text-slate-400" />
                          {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 align-top">
                        <div className="mt-0.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            student.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                              : student.status === 'blocked'
                              ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                          }`}>
                            {student.status || 'active'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right align-middle">
                        <Link
                          href={`/organization/students/${student._id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all shadow-sm"
                        >
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
