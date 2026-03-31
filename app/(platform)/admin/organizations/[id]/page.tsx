'use client';

import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Dynamically import the heavy content with no SSR to prevent "require is not defined" issues
// that can happen in the Next.js server runtime when mixing certain libraries.
const DetailContent = dynamic(() => import('./DetailContent'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  )
});

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params?.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminOrganizationDetail', orgId],
    queryFn: async () => {
      const response = await api.get(`/api/admin/organizations/${orgId}`);
      return response.data;
    },
    enabled: !!orgId
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Navigation Header - Kept in main page for immediate visibility */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Organization Details</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
          <p className="font-semibold text-rose-600">Failed to load organization details.</p>
          <p className="text-sm opacity-70 mt-2">{(error as any)?.response?.data?.message || (error as any)?.message}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      ) : data ? (
        <DetailContent data={data} />
      ) : (
        <div className="text-center py-20 text-slate-500">
          No data available for this organization.
        </div>
      )}
    </div>
  );
}
