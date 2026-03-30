'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Building2, 
  MoreVertical, 
  MapPin, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  ExternalLink,
  Power,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OrganizationCardProps {
  org: any;
  index: number;
}

export function OrganizationCard({ org, index }: OrganizationCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!confirm(`Are you sure you want to delete ${org.name}? This will remove it from the platform.`)) return;
      return api.delete(`/api/admin/organizations/${org._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrganizations'] });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      const newStatus = org.status === 'active' ? 'inactive' : 'active';
      return api.patch(`/api/admin/organizations/${org._id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrganizations'] });
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:border-blue-500/30 transition-all"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between relative">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">{org.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 uppercase tracking-tighter">
                {org.type.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${
                org.status === 'active' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
              }`}>
                {org.status || 'active'}
              </span>
            </div>
          </div>
        </div>

        {/* Three Dots Multi-Action Menu */}
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-2 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 outline-none"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-48 rounded-xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-black ring-opacity-5 p-1 border border-slate-100 dark:border-slate-700">
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 focus:bg-blue-50 dark:focus:bg-blue-500/10 focus:text-blue-600 dark:focus:text-blue-400 transition-colors">
                <Link
                  href={`/dashboard/organizations/${org._id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 w-full"
                >
                  <ExternalLink className="h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 focus:bg-blue-50 dark:focus:bg-blue-500/10 focus:text-blue-600 dark:focus:text-blue-400 transition-colors">
                <Link
                  href={`/dashboard/organizations/edit/${org._id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 w-full"
                >
                  <Edit className="h-4 w-4" /> Edit Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  toggleStatusMutation.mutate();
                }}
                disabled={toggleStatusMutation.isPending}
                className="cursor-pointer rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400 transition-colors w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
              >
                {toggleStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                {org.status === 'active' ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 border-t border-slate-100 dark:border-slate-700" />
              
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  deleteMutation.mutate();
                }}
                disabled={deleteMutation.isPending}
                className="cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 text-red-600 transition-colors w-full flex items-center gap-2 px-3 py-2 text-sm"
              >
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{org.email || 'No email contact'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-slate-400" />
          <span>{org.phone || 'No phone contact'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{org.address || 'Location hidden'}</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500">Active Students</span>
          <span className="text-lg font-semibold text-slate-900 dark:text-white">{org.membersCount || '0'}</span>
        </div>
        <Link 
          href={`/dashboard/organizations/${org._id}`}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          View Full Report &rarr;
        </Link>
      </div>
    </motion.div>
  );
}
