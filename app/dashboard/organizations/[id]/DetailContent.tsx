'use client';

import { motion } from 'framer-motion';
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
  ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

interface DetailContentProps {
  data: any;
}

export default function DetailContent({ data }: DetailContentProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'subscriptions'>('members');
  
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

      {/* Tabs Section */}
      <div className="space-y-6">
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
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                 {subscriptions && subscriptions.map((sub: any, i: number) => (
                   <tr key={sub?._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                     <td className="whitespace-nowrap py-5 pl-6 pr-3">
                        <div className="font-bold text-slate-900 dark:text-white">{sub.planId?.name || 'Standard Plan'}</div>
                        <div className="text-xs text-slate-500">ID: {sub._id?.slice(-8) || 'N/A'}</div>
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
                           <span>From: {sub.startDate || sub.createdAt ? new Date(sub.startDate || sub.createdAt).toLocaleDateString() : 'N/A'}</span>
                           <span className="text-xs opacity-70">To: {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Infinite'}</span>
                        </div>
                     </td>
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
    </div>
  );
}
