'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Building2, Plus, MoreVertical, MapPin, Mail, Phone, Loader2 } from 'lucide-react';

export default function OrganizationsPage() {
  const { data: orgs, isLoading, error } = useQuery({
    queryKey: ['adminOrganizations'],
    queryFn: async () => {
      const response = await api.get('/api/admin/organizations');
      return response.data;
    },
  });
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Organizations</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage all registered academies and coaching centers.</p>
        </div>
        <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/20 px-4 py-2.5 text-sm font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          Add Organization
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
           Failed to load organizations. {(error as any).message}
        </div>
      ) : (orgs?.length === 0) ? (
        <div className="text-center py-20 text-slate-500">
          No organizations registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {orgs?.map((org: any, index: number) => (
            <motion.div
              key={org._id || index}
              initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:border-blue-500/30 transition-all"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">{org.name}</h3>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                    {org.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{org.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                <span>{org.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{org.address}</span>
              </div>
            </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-500">Active Students</span>
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">-</span>
                </div>
                <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  View Details &rarr;
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
