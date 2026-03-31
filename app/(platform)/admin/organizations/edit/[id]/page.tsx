'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Globe,
  LayoutGrid,
  CheckCircle2,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Schema matches backend organization.validator.js
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['coaching_center', 'institution', 'enterprise']),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params?.id as string;
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: detailData, isLoading: isFetching } = useQuery({
    queryKey: ['adminOrganizationDetail', orgId],
    queryFn: async () => {
      const response = await api.get(`/api/admin/organizations/${orgId}`);
      return response.data;
    },
    enabled: !!orgId
  });

  const org = detailData?.organization;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: org ? {
      name: org.name || '',
      type: org.type || 'coaching_center',
      email: org.email || '',
      phone: org.phone || '',
      address: org.address || '',
      status: org.status || 'active',
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
      };
      const response = await api.patch(`/api/admin/organizations/${orgId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrganizations'] });
      queryClient.invalidateQueries({ queryKey: ['adminOrganizationDetail', orgId] });
      toast.success('Organization updated successfully');
      router.push('/admin/organizations');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'Something went wrong. Please try again.');
    },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    mutation.mutate(values);
  };

  if (isFetching) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Edit Organization</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Update workspace details for {detailData?.organization?.name}.</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Left Column: Core Identity */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Organization Settings</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="e.g. Dream IELTS Academy"
                  className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-6 text-sm focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 transition-all font-medium placeholder:text-slate-400`}
                  {...register('name')}
                />
                {errors.name && <p className="text-xs font-medium text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  Institutional Type
                </label>
                <div className="relative group">
                  <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none" />
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-6 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium">
                          <SelectValue placeholder="Select institution type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                          <SelectItem value="coaching_center" className="rounded-lg">Coaching Center</SelectItem>
                          <SelectItem value="institution" className="rounded-lg">Educational Institution</SelectItem>
                          <SelectItem value="enterprise" className="rounded-lg">Corporate Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  Status
                </label>
                <div className="relative group">
                  <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none" />
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-6 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700 dark:text-slate-300">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                          <SelectItem value="active" className="rounded-lg">Active</SelectItem>
                          <SelectItem value="inactive" className="rounded-lg">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Contact & Presence */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/10">
                  <Globe className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Contact Information</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Administrative Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    type="email"
                    placeholder="contact@dreamielts.com"
                    {...register('email')}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl pl-11 pr-4 py-6 text-sm focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 transition-all font-medium placeholder:text-slate-400`}
                  />
                </div>
                {errors.email && <p className="text-xs font-medium text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contact Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    placeholder="+880 1XXX-XXXXXX"
                    {...register('phone')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-6 text-sm focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 transition-all font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Headquarters Address</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Textarea 
                placeholder="Detailed street address, city, and postal code..."
                {...register('address')}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 transition-all font-medium placeholder:text-slate-400 resize-none min-h-[100px]"
              />
            </div>
          </div>

          {serverError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              {serverError}
            </motion.div>
          )}

          <div className="flex items-center justify-end gap-4 border-t border-slate-100 dark:border-slate-800 pt-8 mt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="min-w-[200px] h-12 flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/25 text-sm font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
