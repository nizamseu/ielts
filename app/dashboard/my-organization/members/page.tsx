'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  Loader2,
  ArrowLeft,
  Filter,
  MoreVertical,
  Shield,
  GraduationCap,
  BookOpen,
  UserCog,
  Trash2,
  UserCircle2,
  Crown,
  Mail,
  X,
  Check,
  ChevronDown,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  org_owner: { 
    label: 'Owner', 
    icon: Crown, 
    color: 'text-indigo-700 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-900/50'
  },
  org_admin: { 
    label: 'Admin', 
    icon: Shield, 
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:border-purple-900/50'
  },
  org_teacher: { 
    label: 'Teacher', 
    icon: BookOpen, 
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-900/50'
  },
  org_staff: {
    label: 'Staff',
    icon: UserCog,
    color: 'text-cyan-700 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-500/10 dark:border-cyan-900/50'
  },
  student: { 
    label: 'Student', 
    icon: GraduationCap, 
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
  },
};

const ASSIGNABLE_ROLES = ['org_admin', 'org_teacher', 'org_staff', 'student'];
const FILTER_ROLES = ['all', 'org_admin', 'org_teacher', 'org_staff', 'student'];

export default function MembersPage() {
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role || 'student';
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [roleChangeTarget, setRoleChangeTarget] = useState<any>(null);

  const canManage = ['platform_owner', 'platform_admin', 'org_owner', 'org_admin'].includes(userRole);
  const canChangeRoles = ['platform_owner', 'platform_admin', 'org_owner'].includes(userRole);

  // Fetch members
  const { data, isLoading, error } = useQuery({
    queryKey: ['orgMembers', searchQuery, roleFilter],
    queryFn: async () => {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (roleFilter !== 'all') params.role = roleFilter;
      const response = await api.get('/api/organizations/members', { params });
      return response.data;
    },
  });

  // Remove member mutation
  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      return api.delete(`/api/organizations/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      queryClient.invalidateQueries({ queryKey: ['orgDashboard'] });
      toast.success('Member removed from organization');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    },
  });

  // Role change mutation
  const roleChangeMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return api.patch(`/api/organizations/members/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      queryClient.invalidateQueries({ queryKey: ['orgDashboard'] });
      setRoleChangeTarget(null);
      toast.success('Role updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to change role');
    },
  });

  const handleRemove = (member: any) => {
    if (!confirm(`Remove ${member.name} from your organization? They will lose access to org resources.`)) return;
    removeMutation.mutate(member._id);
  };

  const members = data?.data?.members || [];
  const roleStats = data?.data?.roleStats || {};
  const total = data?.data?.total || 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/my-organization"
          className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Organization
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Members
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {total} total members in your organization
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/20 px-5 py-2.5 text-sm font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          )}
        </div>
      </div>

      {/* Role Stats Chips */}
      <div className="flex flex-wrap gap-3">
        {FILTER_ROLES.map((role) => {
          const isActive = roleFilter === role;
          const count = role === 'all' 
            ? total 
            : roleStats[role] || 0;
          const config = role === 'all' ? null : ROLE_CONFIG[role];
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              {config ? <config.icon className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
              {role === 'all' ? 'All' : config?.label || role}
              <span className={`text-xs font-bold ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl h-11 text-sm"
        />
      </div>

      {/* Members List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/5 dark:border-red-500/20 p-6 text-red-600 dark:text-red-400">
          Failed to load members. {(error as any)?.response?.data?.message || (error as any)?.message}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No members found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery || roleFilter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Start by inviting members to your organization'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map((member: any, i: number) => {
            const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.student;
            const RoleIcon = roleConfig.icon;

            return (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 dark:hover:border-blue-500/20 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm shrink-0">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-slate-400">
                          {member.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{member.email}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {canManage && member.role !== 'org_owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors outline-none opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {canChangeRoles && (
                          <DropdownMenuItem
                            onClick={() => setRoleChangeTarget(member)}
                            className="cursor-pointer"
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRemove(member)}
                          disabled={removeMutation.isPending}
                          className="cursor-pointer text-red-600 focus:text-red-700"
                        >
                          {removeMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Info Row */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-tight uppercase border ${roleConfig.bgColor} ${roleConfig.color}`}>
                      <RoleIcon className="h-3 w-3" />
                      {roleConfig.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight uppercase border ${
                      member.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/50'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/50'
                    }`}>
                      {member.status || 'active'}
                    </span>
                  </div>
                  {member.phone && (
                    <span className="text-[10px] text-slate-400 font-medium">{member.phone}</span>
                  )}
                </div>

                {/* Extra Info */}
                {(member.passportNo || member.nationality) && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {member.passportNo && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 text-[10px] font-medium flex items-center gap-1">
                        <ShieldCheck size={10} /> {member.passportNo}
                      </span>
                    )}
                    {member.nationality && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 text-[10px] font-medium flex items-center gap-1">
                        <Globe size={10} /> {member.nationality}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <InviteMemberModal
            onClose={() => setShowInviteModal(false)}
            userRole={userRole}
          />
        )}
      </AnimatePresence>

      {/* Role Change Modal */}
      <AnimatePresence>
        {roleChangeTarget && (
          <RoleChangeModal
            member={roleChangeTarget}
            onClose={() => setRoleChangeTarget(null)}
            onConfirm={(role) => {
              roleChangeMutation.mutate({ userId: roleChangeTarget._id, role });
            }}
            isPending={roleChangeMutation.isPending}
            userRole={userRole}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Invite Member Modal 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function InviteMemberModal({ onClose, userRole }: { onClose: () => void; userRole: string }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    phone: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/api/organizations/members/invite', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      queryClient.invalidateQueries({ queryKey: ['orgDashboard'] });
      toast.success('Member added successfully');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add member');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    mutation.mutate(formData);
  };

  // org_admin can only assign teacher/staff/student
  const availableRoles = userRole === 'org_admin' 
    ? ASSIGNABLE_ROLES.filter(r => r !== 'org_admin')
    : ASSIGNABLE_ROLES;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Member</h2>
            <p className="text-sm text-slate-500 mt-1">Invite a user to your organization</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {availableRoles.map((role) => {
                const config = ROLE_CONFIG[role];
                const isSelected = formData.role === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, role }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30 shadow-sm ring-1 ring-blue-200 dark:ring-blue-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    <config.icon className="h-4 w-4" />
                    {config.label}
                    {isSelected && <Check className="h-4 w-4 ml-auto text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phone (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Phone <span className="text-slate-400 text-xs font-normal">(optional)</span>
            </label>
            <Input
              placeholder="+880 1XXX-XXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
              className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl px-6 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/20 text-white font-semibold"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Role Change Modal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RoleChangeModal({
  member,
  onClose,
  onConfirm,
  isPending,
  userRole,
}: {
  member: any;
  onClose: () => void;
  onConfirm: (role: string) => void;
  isPending: boolean;
  userRole: string;
}) {
  const [selectedRole, setSelectedRole] = useState(member.role);

  // org_admin can only assign teacher/staff/student
  const availableRoles = userRole === 'org_admin'
    ? ASSIGNABLE_ROLES.filter(r => r !== 'org_admin')
    : ASSIGNABLE_ROLES;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Change Role</h2>
          <p className="text-sm text-slate-500 mt-1">
            Update the role for <span className="font-semibold text-slate-700 dark:text-slate-300">{member.name}</span>
          </p>
        </div>

        <div className="px-8 pb-8 space-y-5">
          {/* Current Role */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
              {member.image ? (
                <img src={member.image} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-slate-500">{member.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{member.name}</p>
              <p className="text-xs text-slate-500">{member.email}</p>
            </div>
          </div>

          {/* Role Options */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select New Role</label>
            <div className="space-y-2">
              {availableRoles.map((role) => {
                const config = ROLE_CONFIG[role];
                const isSelected = selectedRole === role;
                const isCurrent = member.role === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30 ring-1 ring-blue-200 dark:ring-blue-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    <config.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{config.label}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                        Current
                      </span>
                    )}
                    {isSelected && !isCurrent && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={onClose} className="rounded-xl px-6">
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(selectedRole)}
              disabled={isPending || selectedRole === member.role}
              className="rounded-xl px-6 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/20 text-white font-semibold disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
