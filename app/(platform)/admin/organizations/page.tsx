'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, Loader2 } from 'lucide-react';
import { OrganizationCard } from './OrganizationCard';


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
        <Link 
          href="/admin/organizations/add"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/20 px-4 py-2.5 text-sm font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          Add Organization
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
           Failed to load organizations. {((error as unknown) as Error).message}
        </div>
      ) : (orgs?.length === 0) ? (
        <div className="text-center py-20 text-slate-500">
          No organizations registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {orgs?.map((org: { _id?: string; [key: string]: unknown }, index: number) => (
            <OrganizationCard key={org._id || index} org={org} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
