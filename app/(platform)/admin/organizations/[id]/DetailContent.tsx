'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Mail, 
  Phone, 
  MapPin, 
  UserCircle2,
  Calendar,
  Globe,
  ShieldCheck,
  Plus,
  X,
  Zap,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Loader2,
  Trash2
} from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

interface DetailContentProps {
  data: any;
}

export default function DetailContent({ data }: DetailContentProps) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role || 'student';
  const isAdmin = userRole === 'platform_owner' || userRole === 'platform_admin';
  const [activeTab, setActiveTab] = useState<'members' | 'subscriptions'>('members');
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  // Fetch available plans for the modal
  const { data: plansData } = useQuery({
    queryKey: ['orgAvailablePlans'],
    queryFn: async () => {
      const response = await api.get('/api/subscriptions/plans');
      return response.data?.data || [];
    },
    enabled: showPlanModal
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({ planId, cycle }: { planId: string, cycle: string }) => {
      return api.post('/api/subscriptions/subscribe', {
        planId,
        billingCycle: cycle,
        organizationId: data?.organization?._id,
        scope: "organization"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrganizationDetail', data?.organization?._id] });
      toast.success('Subscription plan assigned successfully');
      setShowPlanModal(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to assign plan');
    }
  });

  const deleteSubMutation = useMutation({
    mutationFn: async (subId: string) => {
      if (!confirm('Are you sure you want to permanently delete this subscription record?')) {
        throw new Error('Cancelled');
      }
      return api.delete(`/api/subscriptions/${subId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrganizationDetail', data?.organization?._id] });
      toast.success('Subscription record deleted');
    },
    onError: (err: any) => {
      if (err.message !== 'Cancelled') {
        toast.error(err.response?.data?.message || 'Failed to delete subscription');
      }
    }
  });

  if (!data) return null;
  
  const { organization, members = [], subscriptions = [] } = data;

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-slate-900 dark:text-white">
          <Building2 size={240} />
        </div>

        <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 relative z-10">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/20">
            <Building2 className="h-12 w-12" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{organization?.name || 'Loading...'}</h1>
                {organization?.type && (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                    {organization.type.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="mt-1 text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {organization?.address || 'Address not listed'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Mail className="w-4 h-4" />
                </div>
                {organization?.email || 'No email provided'}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Phone className="w-4 h-4" />
                </div>
                {organization?.phone || 'No phone listed'}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Calendar className="w-4 h-4" />
                </div>
                Since {organization?.createdAt ? new Date(organization.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'members' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" /> People ({members?.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'subscriptions' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Billing & Subscriptions
          </button>
        </div>

        {activeTab === 'subscriptions' && isAdmin && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
               onClick={() => setShowPlanModal(true)}
               className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center gap-2"
            >
               <Plus className="h-4 w-4" /> Assign New Plan
            </Button>
          </motion.div>
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'members' ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {members && members.length === 0 ? (
              <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500">
                No users found in this institution.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(members || []).map((member: any, i: number) => (
                  <motion.div
                    key={member?._id || i}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                        {member?.image ? (
                          <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                        ) : (
                          <UserCircle2 className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                              {member?.name || 'Unknown User'}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-tight uppercase border shrink-0 ${
                                member?.role === 'org_owner' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-900/50' :
                                member?.role === 'org_teacher' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/50' :
                                'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                              }`}>
                                {member?.role?.replace('org_', '') || 'Student'}
                            </span>
                         </div>
                         <p className="text-xs text-slate-500 truncate mt-0.5">{member?.email || 'No email'}</p>
                         
                         <div className="flex flex-wrap gap-2 mt-3">
                            {member?.passportNo && (
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 text-[10px] font-medium flex items-center gap-1">
                                <ShieldCheck size={10} /> {member.passportNo}
                              </span>
                            )}
                            {member?.nationality && (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 text-[10px] font-medium flex items-center gap-1">
                                <Globe size={10} /> {member.nationality}
                              </span>
                            )}
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-hidden bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl"
          >
             <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
               <thead className="bg-slate-50 dark:bg-slate-900/50">
                 <tr>
                    <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Plan</th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Date Range</th>
                    {isAdmin && <th scope="col" className="px-3 py-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>}
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                 {subscriptions && subscriptions.map((sub: any, i: number) => (
                   <tr key={sub?._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                     <td className="whitespace-nowrap py-5 pl-6 pr-3">
                        <div className="font-bold text-slate-900 dark:text-white">{sub.planId?.name || 'Standard Plan'}</div>
                        <div className="text-xs text-slate-500 font-mono tracking-tighter">ID: {sub._id?.slice(-8) || 'N/A'}</div>
                     </td>
                     <td className="whitespace-nowrap px-3 py-5">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                           sub.status === 'active' || !sub.status
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-400'
                        }`}>
                           {(sub.status || 'Active').toUpperCase()}
                        </span>
                     </td>
                     <td className="text-sm text-slate-500 px-3 py-5">
                        <div className="flex flex-col">
                           <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" /> {sub.startDate || sub.createdAt ? new Date(sub.startDate || sub.createdAt).toLocaleDateString() : 'N/A'}</span>
                           <span className="text-xs opacity-70 ml-4.5">to {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Infinite'}</span>
                        </div>
                     </td>
                     {isAdmin && (
                        <td className="whitespace-nowrap px-3 py-5 text-right">
                           <button 
                              onClick={() => deleteSubMutation.mutate(sub._id)}
                              disabled={deleteSubMutation.isPending}
                              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete Subscription"
                           >
                              {deleteSubMutation.isPending && deleteSubMutation.variables === sub._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                           </button>
                        </td>
                     )}
                   </tr>
                 ))}
               </tbody>
             </table>
             {(!subscriptions || subscriptions.length === 0) && (
                <div className="p-20 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/20">No active subscriptions listed.</div>
             )}
          </motion.div>
        )}
      </div>

      {/* Plan Selection Modal */}
      <AnimatePresence>
        {showPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                onClick={() => setShowPlanModal(false)}
             />
             <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10"
             >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                   <div>
                      <h3 className="text-xl font-bold dark:text-white">Select Subscription Plan</h3>
                      <p className="text-sm text-slate-500">Choosing a new plan for {organization?.name}</p>
                   </div>
                   <button onClick={() => setShowPlanModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500">
                      <X className="h-5 w-5" />
                   </button>
                </div>
                
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                   <div className="grid grid-cols-1 gap-4">
                      {plansData?.filter((p: any) => p.type === 'organization').map((plan: any) => (
                        <div 
                          key={plan._id} 
                          className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between group hover:border-blue-500/50 bg-white dark:bg-slate-950/50 transition-all cursor-pointer"
                          onClick={() => subscribeMutation.mutate({ planId: plan._id, cycle: 'monthly' })}
                        >
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                 <Zap className="h-6 w-6" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                                 <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> ৳{plan.priceMonthly}/mo • ৳{plan.priceYearly}/yr
                                 </p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              {subscribeMutation.isPending && subscribeMutation.variables?.planId === plan._id ? (
                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                              ) : (
                                <Button variant="ghost" className="rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                   Activate <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              )}
                           </div>
                        </div>
                      ))}
                      {(!plansData || plansData.length === 0) && (
                        <div className="text-center py-10 text-slate-500">No organization plans found.</div>
                      )}
                   </div>
                </div>
                
                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                   <p className="text-xs text-slate-400 font-medium italic">Assigning a new plan will start a new billing record for this organization immediately.</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
