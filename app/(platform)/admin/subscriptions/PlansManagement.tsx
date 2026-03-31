'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Package, Plus, Edit, Trash2, Power, 
  CheckCircle2, XCircle, Loader2, Save, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PlansManagement() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminPlans'],
    queryFn: async () => {
      const response = await api.get('/api/subscriptions/admin/plans');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newPlan: any) => {
      return api.post('/api/subscriptions/admin/plans', newPlan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      toast.success('Plan created successfully');
      setShowAddForm(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create plan');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      return api.put(`/api/subscriptions/admin/plans/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      toast.success('Plan updated successfully');
      setIsEditing(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update plan');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/api/subscriptions/admin/plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      toast.success('Plan deactivated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to deactivate plan');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const plan = {
      name: formData.get('name'),
      type: formData.get('type'),
      priceMonthly: Number(formData.get('priceMonthly')),
      priceYearly: Number(formData.get('priceYearly')),
      limits: {
        maxStudents: Number(formData.get('maxStudents') || 0),
        maxTeachers: Number(formData.get('maxTeachers') || 0),
        maxAdmins: Number(formData.get('maxAdmins') || 0),
        maxStaff: Number(formData.get('maxStaff') || 0),
        maxExamsPerMonth: Number(formData.get('maxExamsPerMonth') || 0),
        maxAIRequests: Number(formData.get('maxAIRequests') || 0),
      },
      features: {
        allowMockTests: formData.get('allowMockTests') === 'true',
        allowCustomExams: formData.get('allowCustomExams') === 'true',
        allowAIWriting: formData.get('allowAIWriting') === 'true',
        allowAnalytics: formData.get('allowAnalytics') === 'true',
      },
      isActive: formData.get('isActive') === 'true',
    };
    createMutation.mutate(plan);
  };

  const handleUpdate = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const plan = {
      name: formData.get('name'),
      type: formData.get('type'),
      priceMonthly: Number(formData.get('priceMonthly')),
      priceYearly: Number(formData.get('priceYearly')),
      limits: {
        maxStudents: Number(formData.get('maxStudents') || 0),
        maxTeachers: Number(formData.get('maxTeachers') || 0),
        maxAdmins: Number(formData.get('maxAdmins') || 0),
        maxStaff: Number(formData.get('maxStaff') || 0),
        maxExamsPerMonth: Number(formData.get('maxExamsPerMonth') || 0),
        maxAIRequests: Number(formData.get('maxAIRequests') || 0),
      },
      features: {
        allowMockTests: formData.get('allowMockTests') === 'true',
        allowCustomExams: formData.get('allowCustomExams') === 'true',
        allowAIWriting: formData.get('allowAIWriting') === 'true',
        allowAnalytics: formData.get('allowAnalytics') === 'true',
      },
      isActive: formData.get('isActive') === 'true',
    };
    updateMutation.mutate({ id, data: plan });
  };

  const plans = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" /> Subscription Plans
          </h3>
          <p className="text-sm text-slate-500 mt-1">Manage pricing, limits, and features for subscription packages.</p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
            <Plus className="h-4 w-4 mr-2" /> Create Plan
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mb-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h4 className="font-bold text-slate-900 dark:text-white">Create New Plan</h4>
                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <PlanForm onSubmit={handleCreate} isPending={createMutation.isPending} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan: any) => (
          <div key={plan._id} className={`p-6 bg-white dark:bg-slate-900 border rounded-2xl transition-all ${
            plan.isActive 
              ? 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md' 
              : 'border-slate-200 dark:border-slate-800 opacity-60 grayscale'
          }`}>
            {isEditing === plan._id ? (
              <PlanForm 
                initialData={plan} 
                onSubmit={(e) => handleUpdate(e, plan._id)} 
                isPending={updateMutation.isPending}
                onCancel={() => setIsEditing(null)}
              />
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        plan.type === 'organization' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' 
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}>
                        {plan.type}
                      </span>
                      {!plan.isActive && (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold uppercase dark:bg-red-500/10 dark:text-red-400">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-500 mt-2">
                      <span className="text-2xl text-slate-900 dark:text-white">৳{plan.priceMonthly || 0}</span>/mo 
                      <span className="mx-2 text-slate-300">|</span> 
                      <span className="text-lg">৳{plan.priceYearly || 0}</span>/yr
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(plan._id)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {plan.isActive && (
                      <button 
                        onClick={() => {
                          if(confirm('Are you sure you want to deactivate this plan? Existing subscriptions will remain active.')) {
                            deleteMutation.mutate(plan._id);
                          }
                        }}
                        className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 hover:text-red-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Limits</p>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                      <li>• Students: {plan.limits?.maxStudents > 0 ? plan.limits.maxStudents : 'Unlimited'}</li>
                      {plan.type === 'organization' && (
                        <>
                          <li>• Teachers: {plan.limits?.maxTeachers > 0 ? plan.limits.maxTeachers : 'Unlimited'}</li>
                          <li>• Admins: {plan.limits?.maxAdmins > 0 ? plan.limits.maxAdmins : 'Unlimited'}</li>
                          <li>• Staff: {plan.limits?.maxStaff > 0 ? plan.limits.maxStaff : 'Unlimited'}</li>
                        </>
                      )}
                      <li>• Exams/mo: {plan.limits?.maxExamsPerMonth > 0 ? plan.limits.maxExamsPerMonth : 'Unlimited'}</li>
                      <li>• AI Requests: {plan.limits?.maxAIRequests > 0 ? plan.limits.maxAIRequests : 'Unlimited'}</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Features</p>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                      <li className="flex items-center gap-1">
                        {plan.features?.allowMockTests ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-slate-300" />} Mock Tests
                      </li>
                      <li className="flex items-center gap-1">
                        {plan.features?.allowCustomExams ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-slate-300" />} Custom Exams
                      </li>
                      <li className="flex items-center gap-1">
                        {plan.features?.allowAIWriting ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-slate-300" />} AI Writing Eval
                      </li>
                      <li className="flex items-center gap-1">
                        {plan.features?.allowAnalytics ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-slate-300" />} Detailed Analytics
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Reusable Plan Form Component
// ─────────────────────────────────────────────
function PlanForm({ initialData, onSubmit, onCancel, isPending }: { initialData?: any, onSubmit: (e: React.FormEvent) => void, onCancel?: () => void, isPending: boolean }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Plan Name</label>
          <Input name="name" defaultValue={initialData?.name} required placeholder="e.g. Pro Coaching" className="h-10 text-sm rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Type</label>
          <select 
            name="type" 
            defaultValue={initialData?.type || 'organization'} 
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-400"
          >
            <option value="organization">Organization (Coaching Center)</option>
            <option value="individual">Individual (Student)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monthly Price (৳)</label>
          <Input name="priceMonthly" type="number" step="0.01" min="0" defaultValue={initialData?.priceMonthly} required className="h-10 text-sm rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Yearly Price (৳)</label>
          <Input name="priceYearly" type="number" step="0.01" min="0" defaultValue={initialData?.priceYearly} required className="h-10 text-sm rounded-xl" />
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usage Limits (0 = Unlimited)</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-600 dark:text-slate-400">Max Students</label>
            <Input name="maxStudents" type="number" min="0" defaultValue={initialData?.limits?.maxStudents} className="h-10 text-sm rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-600 dark:text-slate-400">Exams / Month</label>
            <Input name="maxExamsPerMonth" type="number" min="0" defaultValue={initialData?.limits?.maxExamsPerMonth} className="h-10 text-sm rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-600 dark:text-slate-400">AI Tokens / Requests</label>
            <Input name="maxAIRequests" type="number" min="0" defaultValue={initialData?.limits?.maxAIRequests} className="h-10 text-sm rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-600 dark:text-slate-400">Max Teachers (Org only)</label>
            <Input name="maxTeachers" type="number" min="0" defaultValue={initialData?.limits?.maxTeachers} className="h-10 text-sm rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-600 dark:text-slate-400">Max Admins (Org only)</label>
            <Input name="maxAdmins" type="number" min="0" defaultValue={initialData?.limits?.maxAdmins} className="h-10 text-sm rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-600 dark:text-slate-400">Max Staff (Org only)</label>
            <Input name="maxStaff" type="number" min="0" defaultValue={initialData?.limits?.maxStaff} className="h-10 text-sm rounded-xl" />
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-4">
        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Features Included</h5>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" name="allowMockTests" value="true" defaultChecked={initialData ? initialData?.features?.allowMockTests : true} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            Allow Mock Tests
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" name="allowCustomExams" value="true" defaultChecked={initialData ? initialData?.features?.allowCustomExams : true} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            Allow Custom Exams
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" name="allowAIWriting" value="true" defaultChecked={initialData ? initialData?.features?.allowAIWriting : true} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            AI Writing Evaluation
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" name="allowAnalytics" value="true" defaultChecked={initialData ? initialData?.features?.allowAnalytics : true} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            Detailed Analytics
          </label>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <input type="checkbox" name="isActive" value="true" defaultChecked={initialData ? initialData?.isActive : true} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Plan is Active (Visible to customers)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl">Cancel</Button>
        )}
        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
          {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {initialData ? 'Save Changes' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
}
