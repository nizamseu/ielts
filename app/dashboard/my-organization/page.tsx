'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import {
  Building2,
  Users,
  GraduationCap,
  UserCog,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  ArrowRight,
  Shield,
  Crown,
  BookOpen,
  TrendingUp,
  Settings,
  UserPlus,
} from 'lucide-react';

export default function MyOrganizationPage() {
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role || 'student';

  const { data, isLoading, error } = useQuery({
    queryKey: ['orgDashboard'],
    queryFn: async () => {
      const response = await api.get('/api/organizations/dashboard');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-sm text-slate-400 font-medium">Loading organization...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errMsg = (error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error';
    return (
      <div className="max-w-xl mx-auto mt-12">
        <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Organization Not Found</h3>
          <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-2">{errMsg}</p>
          <p className="text-sm text-slate-500 mt-4">
            You may not be part of an organization yet. Contact your admin or create one.
          </p>
        </div>
      </div>
    );
  }

  const { organization, stats, subscription, recentMembers } = data?.data || {};
  const canManageMembers = ['platform_owner', 'platform_admin', 'org_owner', 'org_admin'].includes(userRole);
  const canEditOrg = ['platform_owner', 'platform_admin', 'org_owner', 'org_admin'].includes(userRole);

  const statCards = [
    {
      label: 'Total Members',
      value: stats?.totalMembers || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-400',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Students',
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      color: 'from-emerald-500 to-teal-400',
      bgLight: 'bg-emerald-50',
      bgDark: 'dark:bg-emerald-500/10',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Teachers',
      value: stats?.totalTeachers || 0,
      icon: BookOpen,
      color: 'from-amber-500 to-orange-400',
      bgLight: 'bg-amber-50',
      bgDark: 'dark:bg-amber-500/10',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Admins',
      value: stats?.totalAdmins || 0,
      icon: Shield,
      color: 'from-purple-500 to-violet-400',
      bgLight: 'bg-purple-50',
      bgDark: 'dark:bg-purple-500/10',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Organization
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your coaching center, members, and settings
          </p>
        </div>
        {canManageMembers && (
          <Link
            href="/dashboard/my-organization/members"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/20 px-5 py-2.5 text-sm font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Users className="h-4 w-4" />
            Manage Members
          </Link>
        )}
      </div>

      {/* Org Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-blue-500 to-transparent rounded-full transform translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-linear-to-tr from-cyan-500 to-transparent rounded-full transform -translate-x-10 translate-y-10" />
        </div>

        <div className="relative p-8 md:p-10 flex flex-col md:flex-row gap-8">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/20">
            {organization?.logo ? (
              <img src={organization.logo} alt={organization.name} className="h-full w-full object-cover rounded-3xl" />
            ) : (
              <Building2 className="h-12 w-12" />
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {organization?.name || 'My Organization'}
                </h2>
                {organization?.type && (
                  <span className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                    {organization.type.replace('_', ' ')}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  organization?.status === 'active'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                }`}>
                  {organization?.status || 'active'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="truncate">{organization?.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Phone className="w-4 h-4" />
                </div>
                <span>{organization?.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="truncate">{organization?.address || 'No address'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Since {organization?.createdAt ? new Date(organization.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`absolute inset-x-0 bottom-0 h-1 bg-linear-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgLight} ${stat.bgDark}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Grid: Subscription + Recent Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              Subscription
            </h3>
          </div>

          {subscription ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-500/5 dark:to-cyan-500/5 border border-blue-100 dark:border-blue-500/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{subscription.plan}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    subscription.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                {subscription.endDate && (
                  <p className="text-xs text-slate-500">
                    Expires: {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              {subscription.limits && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Limits</h4>
                  <div className="space-y-2">
                    {subscription.limits.maxStudents && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Max Students</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {stats?.totalStudents || 0} / {subscription.limits.maxStudents}
                        </span>
                      </div>
                    )}
                    {subscription.limits.maxExamsPerMonth && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Exams / Month</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {subscription.limits.maxExamsPerMonth}
                        </span>
                      </div>
                    )}
                    {subscription.limits.maxAIRequests && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">AI Requests</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {subscription.limits.maxAIRequests}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No active subscription</p>
              {userRole === 'org_owner' && (
                <Link
                  href="/dashboard/subscriptions"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Subscribe Now <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Recent Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Recent Members
            </h3>
            {canManageMembers && (
              <Link
                href="/dashboard/my-organization/members"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {recentMembers && recentMembers.length > 0 ? (
            <div className="space-y-3">
              {recentMembers.map((member: any, i: number) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          {member.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{member.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-tight uppercase border shrink-0 ${
                    member.role === 'org_owner'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-900/50'
                      : member.role === 'org_admin'
                      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-900/50'
                      : member.role === 'org_teacher'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/50'
                      : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}>
                    {member.role?.replace('org_', '') || 'student'}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">No members yet</p>
              {canManageMembers && (
                <Link
                  href="/dashboard/my-organization/members"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <UserPlus className="h-3 w-3" /> Add Members
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      {canEditOrg && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/my-organization/members"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all group"
            >
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Add Members</p>
                <p className="text-xs text-slate-500">Invite students & teachers</p>
              </div>
            </Link>
            <Link
              href="/dashboard/exams"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all group"
            >
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Create Exam</p>
                <p className="text-xs text-slate-500">Mock tests & custom exams</p>
              </div>
            </Link>
            <Link
              href="/dashboard/reviews"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 transition-all group"
            >
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Reviews</p>
                <p className="text-xs text-slate-500">Flagged sessions</p>
              </div>
            </Link>
            <Link
              href="/dashboard/subscriptions"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-all group"
            >
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 transition-colors">
                <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Billing</p>
                <p className="text-xs text-slate-500">Manage subscription</p>
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
