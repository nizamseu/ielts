'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import PlansManagement from './PlansManagement';

export default function SubscriptionsPage() {
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role || 'student';
  const isAdmin = userRole === 'platform_owner' || userRole === 'platform_admin';
  

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'plans'>('subscriptions');

  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: async () => {
      const response = await api.get('/api/admin/subscriptions');
      return response.data;
    },
    enabled: isAdmin,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Subscriptions</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View actual subscriptions, and manage plans.</p>
        </div>
      </div>

      {isAdmin && (
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === 'subscriptions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              Active Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === 'plans'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              Subscription Plans
            </button>
          </nav>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div>
          {!isAdmin && !isLoading ? (
             <div className="text-center py-20 text-slate-500">
               <CreditCard className="mx-auto h-12 w-12 text-slate-300 mb-4" />
               Current Subscriptions module. Only admins can see cross-organization billing currently.
             </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
               Failed to load subscriptions. {(error as any).message}
            </div>
          ) : (subscriptions?.length === 0) ? (
            <div className="text-center py-20 text-slate-500">
              No active subscriptions found.
            </div>
          ) : (
            <div className="overflow-hidden bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Owner / Organization</th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Started</th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {subscriptions?.map((sub: any, i: number) => (
                    <motion.tr 
                       key={sub._id || i}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                           <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {sub.userId?.name || sub.organizationId?.name || 'Unknown'}
                          </div>
                          <div className="text-slate-500 text-xs mt-0.5">
                            {sub.planId ? sub.planId.name : 'Unknown Plan'}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                           sub.status === 'active' || !sub.status
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20' 
                            : 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-400 dark:ring-rose-400/20'
                        }`}>
                          {(sub.status || 'Active').toUpperCase()}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">
                         {new Date(sub.startDate || sub.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">
                         {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'plans' && isAdmin && (
        <PlansManagement />
      )}
    </div>
  );
}
