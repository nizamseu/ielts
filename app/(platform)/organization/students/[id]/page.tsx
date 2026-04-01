'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  GraduationCap,
  Mail,
  Phone,
  Globe,
  ShieldCheck,
  Calendar,
  UserCircle2,
  MapPin,
  Clock,
  Shield,
  User,
  Hash,
} from 'lucide-react';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['studentDetail', studentId],
    queryFn: async () => {
      const response = await api.get(`/api/organizations/members/${studentId}`);
      return response.data;
    },
    enabled: !!studentId,
  });

  const student = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm text-slate-400 font-medium">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errMsg = (error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error';
    return (
      <div className="space-y-6 pb-10">
        <Link
          href="/organization/students"
          className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Students
        </Link>
        <div className="max-w-xl mx-auto mt-8">
          <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <UserCircle2 className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Student Not Found</h3>
            <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-2">{errMsg}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) return null;

  const infoFields = [
    { label: 'Full Name', value: student.name, icon: User },
    { label: 'First Name', value: student.firstName, icon: User },
    { label: 'Surname', value: student.surname, icon: User },
    { label: 'Email', value: student.email, icon: Mail },
    { label: 'Phone', value: student.phone, icon: Phone },
    { label: 'Passport No.', value: student.passportNo, icon: ShieldCheck },
    { label: 'Nationality', value: student.nationality, icon: Globe },
    { label: 'Country', value: student.country, icon: MapPin },
    { label: 'Role', value: student.role?.replace(/_/g, ' '), icon: Shield },
    { label: 'Member Since', value: student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null, icon: Calendar },
    { label: 'Last Updated', value: student.updatedAt ? new Date(student.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null, icon: Clock },
  ].filter(f => f.value);

  return (
    <div className="space-y-8 pb-10">
      {/* Back Navigation */}
      <Link
        href="/organization/students"
        className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Students
      </Link>

      {/* Profile Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        {/* Decorative gradient top */}
        <div className="h-32 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
        </div>

        <div className="relative px-8 pb-8">
          {/* Avatar */}
          <div className="-mt-16 mb-6">
            <div className="h-28 w-28 rounded-3xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center overflow-hidden">
              {student.image ? (
                <img src={student.image} alt={student.name} className="h-full w-full object-cover rounded-2xl" />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center rounded-2xl">
                  <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                    {student.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Name & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {student.name}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                {student.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                student.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : student.status === 'blocked'
                  ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
              }`}>
                {student.status || 'active'}
              </span>
              <span className="px-4 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                Student
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-500" />
            Profile Information
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {infoFields.map((field, i) => (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              className="flex items-center gap-4 px-8 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 shrink-0">
                <field.icon className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {field.label}
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5 truncate capitalize">
                  {field.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Preferences */}
      {student.preferences && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Hash className="h-5 w-5 text-emerald-500" />
              Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8">
            {student.preferences.timezone && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Timezone</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{student.preferences.timezone}</p>
              </div>
            )}
            {student.preferences.language && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Language</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-1 uppercase">{student.preferences.language}</p>
              </div>
            )}
            {student.preferences.targetBand && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Band</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{student.preferences.targetBand}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ID Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-200/50 dark:bg-slate-700">
              <Hash className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">User ID</p>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-0.5">{student._id}</p>
            </div>
          </div>
          {student.emailVerified !== undefined && (
            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
              student.emailVerified
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
            }`}>
              {student.emailVerified ? 'Email Verified' : 'Email Unverified'}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
