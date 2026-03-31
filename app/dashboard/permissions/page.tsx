'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit2, 
  RefreshCcw, 
  ChevronDown, 
  ChevronUp,
  Users, 
  GraduationCap, 
  CreditCard, 
  BookOpen, 
  Building2, 
  Lock, 
  Check, 
  X, 
  Layout, 
  Settings, 
  Shield, 
  UserCircle,
  Package,
  FileText,
  Trash2,
  ClipboardList,
  Headphones,
  PenTool,
  MessageSquare,
  Star,
  BarChart3,
  Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- CONFIGURATION ---
const RESOURCE_GROUPS = [
  {
    id: 'users',
    name: 'USERS',
    icon: Users,
    color: '#3b82f6',
    resources: [
      { id: 'user', label: 'User Management', icon: UserCircle },
    ]
  },
  {
    id: 'students',
    name: 'STUDENTS',
    icon: GraduationCap,
    color: '#10b981',
    resources: [
      { id: 'student', label: 'All Students', icon: BookOpen },
      { id: 'my_student', label: 'My Students', icon: UserCircle },
    ]
  },
  {
    id: 'finance',
    name: 'FINANCE',
    icon: CreditCard,
    color: '#f59e0b',
    resources: [
      { id: 'billing', label: 'Collections', icon: FileText },
      { id: 'plan', label: 'Access Plans', icon: Package },
    ]
  },
  {
    id: 'exams',
    name: 'EXAMS & CONTENT',
    icon: ClipboardList,
    color: '#8b5cf6',
    resources: [
      { id: 'exam', label: 'Exam Templates', icon: Layout },
      { id: 'question', label: 'Question Bank', icon: FileText },
      { id: 'listening', label: 'Listening Tests', icon: Headphones },
      { id: 'writing', label: 'Writing Tasks', icon: PenTool },
      { id: 'speaking', label: 'Speaking Practice', icon: MessageSquare },
    ]
  },
  {
    id: 'system',
    name: 'SYSTEM & SETTINGS',
    icon: Settings,
    color: '#6366f1',
    resources: [
      { id: 'organization', label: 'Organization', icon: Building2 },
      { id: 'role_management', label: 'Role Management', icon: Shield },
      { id: 'review', label: 'Reviews & Ratings', icon: Star },
      { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
      { id: 'activity_log', label: 'Activity Log', icon: Activity },
    ]
  }
];

const ACTIONS = [
  { id: 'create', label: 'Create' },
  { id: 'read', label: 'Read' },
  { id: 'update', label: 'Update' },
  { id: 'delete', label: 'Delete' },
];

const BADGE_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#64748b', // Slate
  '#1e293b', // Dark Slate
];

// --- MAIN COMPONENT ---
export default function PermissionRoleDashboard() {
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'roles' | 'assignments'>('roles');
  const [expandedCards, setExpandedCards] = useState<string[]>([]);

  const { data: roles, isLoading } = useQuery({
    queryKey: ['adminRolePermissions'],
    queryFn: async () => {
      const res = await api.get('/api/admin/role-permissions');
      return res.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updated: any) => api.patch(`/api/admin/role-permissions/${updated._id}`, updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRolePermissions'] });
      setEditingRole(null);
      toast.success('Permissions updated successfully');
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/admin/role-permissions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRolePermissions'] });
      setIsCreating(false);
      toast.success('New role created');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/role-permissions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRolePermissions'] });
      toast.success('Role deleted');
    }
  });

  const stats = useMemo(() => {
    if (!roles) return { total: 0, system: 0, custom: 0, users: 0 };
    return {
      total: roles.length,
      system: roles.filter((r: any) => r.context === 'platform').length,
      custom: roles.filter((r: any) => r.context === 'organization').length,
      users: 0,
    };
  }, [roles]);

  const filteredRoles = useMemo(() => {
    return roles?.filter((r: any) => 
      r.role.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [roles, searchTerm]);

  const systemRoles = filteredRoles.filter((r: any) => r.context === 'platform');
  const customRoles = filteredRoles.filter((r: any) => r.context === 'organization');

  const toggleCardExpand = (id: string) => {
    setExpandedCards(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* ─── Page Header ─── */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Role Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Create and manage roles, set granular permissions, and assign roles to users.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['adminRolePermissions'] })}
              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <RefreshCcw size={15} />
            </button>
            <Button 
              onClick={() => setIsCreating(true)}
              className="h-9 px-4 rounded-lg bg-slate-900 dark:bg-blue-600 text-white text-sm font-semibold hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors gap-2"
            >
              <Plus size={16} />
              New Role
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Roles" value={stats.total} icon={Shield} bgColor="#eef2ff" iconColor="#6366f1" />
          <StatCard label="System Roles" value={stats.system} icon={Lock} bgColor="#fff7ed" iconColor="#f97316" />
          <StatCard label="Custom Roles" value={stats.custom} icon={ShieldCheck} bgColor="#ecfdf5" iconColor="#10b981" />
          <StatCard label="Total Users" value={stats.users} icon={Users} bgColor="#eff6ff" iconColor="#3b82f6" />
        </div>

        {/* ─── Separator ─── */}
        <div className="border-t border-slate-200/60 dark:border-slate-800" />

        {/* ─── Tabs & Search ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
            <TabButton 
              active={activeTab === 'roles'} 
              onClick={() => setActiveTab('roles')} 
              icon={Shield} 
              label="Roles & Permissions" 
            />
            <TabButton 
              active={activeTab === 'assignments'} 
              onClick={() => setActiveTab('assignments')} 
              icon={Users} 
              label="User Role Assignment" 
            />
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search roles..."
              className="h-9 w-full sm:w-64 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* ─── System Roles Section ─── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider px-0.5">
            <Lock size={13} />
            SYSTEM ROLES
            <span className="bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-bold ml-1">
              {systemRoles.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {systemRoles.map((role: any) => (
              <RoleCard 
                key={role._id} 
                role={role} 
                isSystem
                isExpanded={expandedCards.includes(role._id)}
                onToggleExpand={() => toggleCardExpand(role._id)}
                onEdit={() => setEditingRole(role)}
              />
            ))}
          </div>
        </section>

        {/* ─── Custom Roles Section ─── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider px-0.5">
            <ShieldCheck size={13} />
            CUSTOM ROLES
            <span className="bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-bold ml-1">
              {customRoles.length}
            </span>
          </div>
          
          {customRoles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-600">
                <Shield size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">No custom roles yet</h3>
                <p className="text-sm text-slate-400 max-w-[320px]">
                  Create custom roles with specific permissions tailored for your organization&apos;s needs.
                </p>
              </div>
              <Button 
                onClick={() => setIsCreating(true)} 
                className="bg-slate-900 dark:bg-blue-600 h-10 px-6 rounded-lg text-sm font-semibold"
              >
                <Plus size={16} className="mr-2" /> Create First Role
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {customRoles.map((role: any) => (
                <RoleCard 
                  key={role._id} 
                  role={role}
                  isExpanded={expandedCards.includes(role._id)}
                  onToggleExpand={() => toggleCardExpand(role._id)}
                  onEdit={() => setEditingRole(role)} 
                  onDelete={() => {
                    if (confirm('Are you sure you want to delete this role?')) {
                      deleteMutation.mutate(role._id);
                    }
                  }}
                />
              ))}
              <button 
                onClick={() => setIsCreating(true)}
                className="group border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-900/50 transition-all cursor-pointer min-h-[200px]"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-500 dark:group-hover:bg-blue-900/30 transition-all">
                  <Plus size={20} />
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add New Role</span>
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ─── Side Panel Modal ─── */}
      <AnimatePresence>
        {(editingRole || isCreating) && (
          <RoleSidePanel 
            role={editingRole} 
            isNew={isCreating}
            onClose={() => { setEditingRole(null); setIsCreating(false); }}
            onSave={(data) => editingRole ? updateMutation.mutate(data) : createMutation.mutate(data)}
            onDelete={(id) => { if(confirm('Delete this role?')) deleteMutation.mutate(id); }}
            isSaving={updateMutation.isPending || createMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

function StatCard({ label, value, icon: Icon, bgColor, iconColor }: {
  label: string; value: number; icon: any; bgColor: string; iconColor: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div 
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div>
        <h4 className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{value}</h4>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all",
        active 
          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
      )}
    >
      <Icon size={14} className={active ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} />
      {label}
    </button>
  );
}

// ─── Role Card with inline expandable permission table ───
function RoleCard({ role, isSystem, isExpanded, onToggleExpand, onEdit, onDelete }: {
  role: any;
  isSystem?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  const permCount = role.permissions?.reduce((acc: number, p: any) => acc + p.actions.length, 0) || 0;
  const resourceCount = role.permissions?.length || 0;
  const isSuperAdmin = role.role === 'platform_owner' || role.role === 'super_admin';

  // Build a lookup map for quick permission checking
  const permMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    role.permissions?.forEach((p: any) => {
      map[p.resource] = new Set(p.actions);
    });
    return map;
  }, [role.permissions]);

  const hasAction = (resource: string, action: string) => {
    return permMap[resource]?.has(action) || permMap[resource]?.has('*') || false;
  };

  // Flatten all resources for the permission table
  const allResources = RESOURCE_GROUPS.flatMap(g => 
    g.resources.map(r => ({ ...r, groupIcon: g.icon, groupColor: g.color }))
  );

  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden",
      isExpanded && "col-span-1 md:col-span-2"
    )}>
      {/* Colored top border */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: role.color || '#4F46E5' }} />
      
      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${role.color || '#4F46E5'}15` }}
            >
              {isSuperAdmin ? (
                <Lock size={18} style={{ color: role.color || '#ef4444' }} />
              ) : (
                <Shield size={18} style={{ color: role.color || '#4F46E5' }} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 dark:text-white capitalize text-sm">
                  {role.role.replace(/_/g, ' ')}
                </h3>
                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                  {role.context === 'platform' ? 'System' : 'Custom'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{role.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={onEdit} 
              className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            >
              <Edit2 size={15} />
            </button>
            {onDelete && (
              <button 
                onClick={onDelete}
                className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 min-h-[28px]">
          {role.description || 'Custom role with defined authorizations.'}
        </p>

        {/* Footer / Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          {isSuperAdmin ? (
            <span 
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
              style={{ 
                color: role.color || '#ef4444', 
                backgroundColor: `${role.color || '#ef4444'}12` 
              }}
            >
              Full Access
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">
              {resourceCount} resources · {permCount} actions
            </span>
          )}
          {!isSuperAdmin && (
            <button 
              onClick={onToggleExpand}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {isExpanded ? 'Hide' : 'View'}
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* ─── Expanded Permission Table ─── */}
      <AnimatePresence>
        {isExpanded && !isSuperAdmin && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 dark:border-slate-800 px-5 pb-5">
              <table className="w-full mt-3">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="text-left py-2 pr-2">Resource</th>
                    <th className="text-center py-2 w-16">Create</th>
                    <th className="text-center py-2 w-16">Read</th>
                    <th className="text-center py-2 w-16">Update</th>
                    <th className="text-center py-2 w-16">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {allResources.map(res => {
                    const GroupIcon = res.groupIcon;
                    return (
                      <tr key={res.id} className="group/row hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ color: res.groupColor }}>
                              <res.icon size={13} />
                            </span>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{res.label}</span>
                          </div>
                        </td>
                        {ACTIONS.map(action => (
                          <td key={action.id} className="text-center py-2">
                            {hasAction(res.id, action.id) ? (
                              <Check size={15} className="inline-block text-emerald-500" />
                            ) : (
                              <X size={13} className="inline-block text-slate-300 dark:text-slate-600" />
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Side Panel for Create / Edit ───
function RoleSidePanel({ role, isNew, onClose, onSave, onDelete, isSaving }: { 
  role: any; 
  isNew: boolean; 
  onClose: () => void; 
  onSave: (data: any) => void; 
  onDelete: (id: string) => void; 
  isSaving: boolean; 
}) {
  const [formData, setFormData] = useState({
    _id: role?._id,
    role: role?.role || '',
    description: role?.description || '',
    context: role?.context || 'organization',
    color: role?.color || BADGE_COLORS[0],
    permissions: role?.permissions || []
  });

  const [expandedResources, setExpandedResources] = useState<string[]>([]);

  const toggleResourceExpand = (resId: string) => {
    setExpandedResources(prev =>
      prev.includes(resId) ? prev.filter(id => id !== resId) : [...prev, resId]
    );
  };

  const getSelectedCount = (resId: string) => {
    const block = formData.permissions.find((p: any) => p.resource === resId);
    return block?.actions.length || 0;
  };

  const toggleAction = (resId: string, action: string) => {
    let updated = [...formData.permissions];
    const idx = updated.findIndex((p: any) => p.resource === resId);
    if (idx === -1) {
       updated.push({ resource: resId, actions: [action] });
    } else {
       const actions = [...updated[idx].actions];
       const aIdx = actions.indexOf(action);
       if (aIdx === -1) actions.push(action);
       else actions.splice(aIdx, 1);
       if (actions.length === 0) updated.splice(idx, 1);
       else updated[idx] = { ...updated[idx], actions };
    }
    setFormData({ ...formData, permissions: updated });
  };

  const toggleAllResource = (resId: string) => {
    let updated = [...formData.permissions];
    const idx = updated.findIndex((p: any) => p.resource === resId);
    const allActions = ACTIONS.map(a => a.id);
    
    if (idx !== -1 && updated[idx].actions.length === allActions.length) {
      // Uncheck all
      updated.splice(idx, 1);
    } else {
      // Check all
      if (idx === -1) {
        updated.push({ resource: resId, actions: allActions });
      } else {
        updated[idx] = { ...updated[idx], actions: allActions };
      }
    }
    setFormData({ ...formData, permissions: updated });
  };

  const isChecked = (resId: string, action: string) => {
    const block = formData.permissions.find((p: any) => p.resource === resId);
    return block?.actions.includes(action) || block?.actions.includes('*');
  };

  const isAllChecked = (resId: string) => {
    const block = formData.permissions.find((p: any) => p.resource === resId);
    return block?.actions.length === ACTIONS.length || block?.actions.includes('*');
  };

  const totalResources = formData.permissions.length;
  const totalActions = formData.permissions.reduce((acc: number, p: any) => acc + p.actions.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" 
      />
      
      {/* Panel */}
      <motion.div 
        initial={{ x: '100%' }} 
        animate={{ x: 0 }} 
        exit={{ x: '100%' }} 
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl flex flex-col"
      >
        {/* Panel Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {isNew ? 'Create New Role' : 'Edit Role'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isNew ? 'Define the permissions for the new role.' : `Editing ${role?.role?.replace(/_/g, ' ')}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 transition-colors mt-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Panel Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Role Name + Badge Color */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Role Name <span className="text-red-500">*</span></label>
                <input 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  disabled={!isNew && (role?.role === 'platform_owner' || role?.role === 'super_admin')}
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-slate-700 dark:text-slate-300 disabled:opacity-50"
                  placeholder="e.g. Marketing Manager"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Badge Color</label>
                <div className="flex flex-wrap gap-1.5 items-center pt-0.5">
                  {BADGE_COLORS.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setFormData({ ...formData, color: c })} 
                      className={cn(
                        "w-7 h-7 rounded-full transition-all ring-offset-2 dark:ring-offset-slate-900 flex items-center justify-center",
                        formData.color === c && "ring-2 ring-slate-400 dark:ring-slate-500 scale-110"
                      )} 
                      style={{ backgroundColor: c }}
                    >
                      {formData.color === c && <Check size={12} className="text-white" />}
                    </button>
                  ))}
                  {/* Custom color picker */}
                  <label
                    className={cn(
                      "w-7 h-7 rounded-md border-2 border-dashed cursor-pointer transition-all flex items-center justify-center overflow-hidden",
                      !BADGE_COLORS.includes(formData.color)
                        ? "ring-2 ring-slate-400 dark:ring-slate-500 scale-110 border-solid"
                        : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
                    )}
                    style={!BADGE_COLORS.includes(formData.color) ? { backgroundColor: formData.color } : {}}
                    title="Pick a custom color"
                  >
                    {BADGE_COLORS.includes(formData.color) && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    )}
                    {!BADGE_COLORS.includes(formData.color) && <Check size={12} className="text-white" />}
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-20 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 outline-none transition-all text-sm resize-none text-slate-700 dark:text-slate-300"
                placeholder="Describe what this role can do..."
              />
            </div>
          </div>

          {/* ─── Permissions ─── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Permissions</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {totalResources} resources · {totalActions} actions selected
                </p>
              </div>
              <button 
                onClick={() => setFormData({ ...formData, permissions: [] })} 
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Clear all
              </button>
            </div>
            
            <div className="space-y-2">
              {RESOURCE_GROUPS.map(group => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.id} className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                    {/* Group header */}
                    <div 
                      className="px-3.5 py-2 flex items-center gap-2 bg-slate-50/80 dark:bg-slate-800/50"
                      style={{ borderLeft: `3px solid ${group.color}` }}
                    >
                      <GroupIcon size={13} style={{ color: group.color }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{group.name}</span>
                    </div>
                    
                    {/* Resources */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {group.resources.map(res => {
                        const ResIcon = res.icon;
                        const allChecked = isAllChecked(res.id);
                        const selectedCount = getSelectedCount(res.id);
                        const isResExpanded = expandedResources.includes(res.id);
                        return (
                          <div key={res.id} className="px-3.5 py-2.5">
                            {/* Resource header row */}
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => toggleResourceExpand(res.id)}
                                className="flex items-center gap-2 flex-1 min-w-0"
                              >
                                <ResIcon size={14} className="text-slate-400 flex-shrink-0" />
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{res.label}</span>
                                {selectedCount > 0 && (
                                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex-shrink-0">
                                    {selectedCount} selected
                                  </span>
                                )}
                              </button>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => toggleResourceExpand(res.id)}
                                  className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                  <ChevronDown size={14} className={cn("transition-transform", isResExpanded && "rotate-180")} />
                                </button>
                                {/* Select all checkbox */}
                                <button
                                  onClick={() => toggleAllResource(res.id)}
                                  className={cn(
                                    "rounded border flex items-center justify-center transition-all",
                                    allChecked 
                                      ? "bg-blue-600 border-blue-600 text-white" 
                                      : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
                                  )}
                                  style={{ width: 16, height: 16 }}
                                >
                                  {allChecked && <Check size={10} />}
                                </button>
                              </div>
                            </div>
                            
                            {/* CRUD checkbox toggles (collapsible) */}
                            <AnimatePresence>
                              {isResExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden"
                                >
                                  <div className="grid grid-cols-4 gap-2 pt-2.5">
                                    {ACTIONS.map(action => {
                                      const checked = isChecked(res.id, action.id);
                                      return (
                                        <button
                                          key={action.id}
                                          onClick={() => toggleAction(res.id, action.id)}
                                          className={cn(
                                            "flex items-center gap-2 h-8 px-2.5 rounded-md border transition-all text-left",
                                            checked
                                              ? "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600"
                                          )}
                                        >
                                          {/* Checkbox square */}
                                          <span
                                            className={cn(
                                              "flex-shrink-0 rounded-[3px] border flex items-center justify-center transition-all",
                                              checked
                                                ? "bg-blue-600 border-blue-600 text-white"
                                                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                            )}
                                            style={{ width: 15, height: 15 }}
                                          >
                                            {checked && <Check size={10} strokeWidth={3} />}
                                          </span>
                                          <span className={cn(
                                            "text-[11px] font-medium capitalize",
                                            checked ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
                                          )}>
                                            {action.label}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          {!isNew && role?.role !== 'platform_owner' && role?.role !== 'super_admin' ? (
            <button 
              onClick={() => onDelete(role._id)} 
              className="text-red-500 dark:text-red-400 text-xs font-semibold hover:underline flex items-center gap-1.5"
            >
              <Trash2 size={13} />
              Delete Role
            </button>
          ) : <div />}
          <div className="flex gap-2.5">
            <Button 
              variant="ghost" 
              onClick={onClose} 
              className="h-9 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => onSave(formData)} 
              disabled={isSaving || !formData.role} 
              className="h-9 px-5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 gap-2"
            >
              {isSaving ? (
                <RefreshCcw size={14} className="animate-spin" />
              ) : (
                <ShieldCheck size={14} />
              )}
              {isNew ? 'Create Role' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-600/20 rounded-full animate-ping" />
        <RefreshCcw className="w-6 h-6 text-blue-600 animate-spin relative" />
      </div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading Roles...</p>
    </div>
  );
}
