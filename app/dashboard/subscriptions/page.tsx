'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, Package, CheckCircle2, Zap, Calendar, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import PlansManagement from './PlansManagement';
import { Button } from '@/components/ui/button';

export default function SubscriptionsPage() {
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role || 'student';
  const isAdmin = userRole === 'platform_owner' || userRole === 'platform_admin';
  

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'plans'>('subscriptions');

  // Adim: Get all subscriptions across platform
  const { data: allSubscriptions, isLoading: adminLoading } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: async () => {
      const response = await api.get('/api/admin/subscriptions');
      return response.data;
    },
    enabled: isAdmin,
  });

  // User: Get personal/org subscription info
  const { data: mySubData, isLoading: myLoading } = useQuery({
    queryKey: ['mySubscription'],
    queryFn: async () => {
      const response = await api.get('/api/subscriptions/me');
      return response.data;
    }
  });

  // All: Get active plans for the "Marketplace/Pricing" view
  const { data: activePlans, isLoading: plansLoading } = useQuery({
    queryKey: ['activePlansMarketplace'],
    queryFn: async () => {
      const response = await api.get('/api/subscriptions/plans');
      return response.data?.data || [];
    }
  });

  const isLoading = adminLoading || myLoading || plansLoading;
  const mySubscription = mySubData?.data;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isAdmin ? 'System Subscriptions' : 'My Subscription'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isAdmin ? 'Monitor active memberships across the platform.' : 'Manage your billing and view your current plan details.'}
          </p>
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
              Subscription Plans (Admin)
            </button>
          </nav>
        </div>
      )}

      {/* ADMIN VIEW: TABBED TABLES */}
      {isAdmin && activeTab === 'subscriptions' && (
        <div className="overflow-hidden bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="py-4 pl-6 pr-3 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Target</th>
                <th className="px-3 py-4 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Plan</th>
                <th className="px-3 py-4 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-3 py-4 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Started</th>
                <th className="px-3 py-4 text-left text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {allSubscriptions?.map((sub: any, i: number) => (
                <tr key={sub._id || i}>
                  <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm font-medium text-slate-900 dark:text-white">
                    {sub.userId?.name || sub.organizationId?.name || 'Unknown'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-5 text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {sub.planId?.name || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-5">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        sub.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {sub.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500">
                    {new Date(sub.startDate || sub.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500">
                    {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Infinite'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!allSubscriptions || allSubscriptions.length === 0) && (
            <div className="p-20 text-center text-slate-400 italic">No subscriptions found platform-wide.</div>
          )}
        </div>
      )}

      {isAdmin && activeTab === 'plans' && <PlansManagement />}

      {/* USER VIEW: ACTIVE STATUS + MARKETPLACE */}
      {!isAdmin && (
        <div className="space-y-10">
          {/* Current Plan Highlight */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 p-8 md:p-10 shadow-2xl text-white">
             {/* Background glow */}
             <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/20 blur-[100px]" />
             <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/10 blur-[80px]" />

             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-6 text-center md:text-left">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-widest text-blue-200 border border-white/10">
                      <Zap className="w-3.5 h-3.5" /> Current Subscription
                   </div>
                   <div>
                      <h3 className="text-4xl font-extrabold tracking-tight">
                        {mySubscription ? mySubscription.planId?.name : 'Free Tier'}
                      </h3>
                      <p className="mt-2 text-slate-400 text-lg">
                        {mySubscription 
                           ? `Active ${mySubscription.billingCycle} billing since ${new Date(mySubscription.startDate).toLocaleDateString()}` 
                           : 'You are currently on the basic free access plan.'}
                      </p>
                   </div>
                   
                   {mySubscription && (
                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                         <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                            <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Expires</span>
                            <span className="text-sm font-semibold">{new Date(mySubscription.endDate).toLocaleDateString()}</span>
                         </div>
                         <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                            <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Billing ID</span>
                            <span className="text-sm font-mono text-slate-300">#{mySubscription._id.slice(-8).toUpperCase()}</span>
                         </div>
                      </div>
                   )}
                </div>
                
                <div className="shrink-0">
                   <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-linear-to-br from-blue-600 to-cyan-500 shadow-xl shadow-blue-500/30">
                      <CreditCard className="h-16 w-16 text-white" />
                   </div>
                </div>
             </div>
          </div>

          {/* Available Plans Marketplace */}
          <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h3 className="text-xl font-bold dark:text-white">Upgrade Your Experience</h3>
                   <p className="text-sm text-slate-500">Pick a tailored plan that fits your current goals.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                   <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 shadow-sm text-blue-600">BDT Packages</button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activePlans || []).filter((p: any) => {
                  // If user is org owner, show only organization plans
                  // If individual user, show only individual plans
                  const isOrgContext = (session?.user as any)?.organizationId;
                  return isOrgContext ? p.type === 'organization' : p.type === 'individual';
                }).map((plan: any) => (
                  <motion.div 
                     key={plan._id}
                     whileHover={{ y: -5 }}
                     className={`relative p-8 rounded-3xl border transition-all flex flex-col ${
                        mySubscription?.planId?._id === plan._id 
                          ? 'bg-blue-50/30 border-blue-200 dark:bg-blue-500/5 dark:border-blue-500/20' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                     }`}
                  >
                     {mySubscription?.planId?._id === plan._id && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                           <CheckCircle2 className="w-3 h-3" /> Active Now
                        </div>
                     )}

                     <div className="mb-6">
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                        <div className="mt-4 flex items-baseline">
                           <span className="text-4xl font-extrabold text-slate-900 dark:text-white">৳{plan.priceMonthly}</span>
                           <span className="ml-1 text-slate-500 dark:text-slate-400">/mo</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-1">Or ৳{plan.priceYearly}/year (Save ~16%)</p>
                     </div>

                     <ul className="space-y-4 mb-10 flex-1">
                        <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                           {plan.limits?.maxStudents > 0 ? `${plan.limits.maxStudents} Students` : 'Unlimited Students'}
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                           {plan.limits?.maxExamsPerMonth > 0 ? `${plan.limits.maxExamsPerMonth} Exams / mo` : 'Unlimited Exams'}
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                           {plan.limits?.maxAIRequests > 0 ? `${plan.limits.maxAIRequests} AI Evaluations` : 'Unlimited AI Writing'}
                        </li>
                        {plan.features?.allowAnalytics && (
                           <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                              Advanced Analytics Dashboard
                           </li>
                        )}
                        {plan.features?.allowCustomExams && (
                           <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                              Create Custom Exams
                           </li>
                        )}
                     </ul>

                     <Button 
                        disabled={mySubscription?.planId?._id === plan._id}
                        className={`w-full h-12 rounded-2xl font-bold tracking-tight shadow-lg transition-all ${
                           mySubscription?.planId?._id === plan._id
                             ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                             : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                        }`}
                     >
                        {mySubscription?.planId?._id === plan._id ? 'Current Plan' : 'Choose Plan'}
                     </Button>
                  </motion.div>
                ))}
             </div>
             
             <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/20 text-center border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 italic max-w-xl mx-auto">
                   Choosing a new plan will redirect you to our secure payment gateway to verify your identity and BDT transaction details.
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
