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
  MoreHorizontal,
  ChevronRight,
  UserCircle,
  Package,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle
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
    color: 'blue',
    resources: [
      { id: 'user', label: 'User Management', icon: UserCircle },
    ]
  },
  {
    id: 'students',
    name: 'STUDENTS',
    icon: GraduationCap,
    color: 'emerald',
    resources: [
      { id: 'student', label: 'All Students', icon: BookOpen },
      { id: 'my_student', label: 'My Students', icon: UserCircle },
    ]
  },
  {
    id: 'finance',
    name: 'FINANCE',
    icon: CreditCard,
    color: 'amber',
    resources: [
      { id: 'billing', label: 'Collections', icon: FileText },
      { id: 'plan', label: 'Access Plans', icon: Package },
    ]
  },
  {
    id: 'system',
    name: 'SYSTEM',
    icon: Settings,
    color: 'indigo',
    resources: [
      { id: 'exam', label: 'Exams & Questions', icon: Layout },
      { id: 'organization', label: 'Organization Settings', icon: Building2 },
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
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#64748b', // Slate
];

// --- MAIN COMPONENT ---
export default function PermissionRoleDashboard() {
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'roles' | 'assignments'>('roles');

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
    if (!roles) return { total: 0, system: 0, custom: 0, users: 8 };
    return {
      total: roles.length,
      system: roles.filter((r: any) => r.context === 'platform').length,
      custom: roles.filter((r: any) => r.context === 'organization').length,
      users: 8,
    };
  }, [roles]);

  const filteredRoles = useMemo(() => {
    return roles?.filter((r: any) => 
      r.role.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [roles, searchTerm]);

  const systemRoles = filteredRoles.filter((r: any) => r.context === 'platform');
  const customRoles = filteredRoles.filter((r: any) => r.context === 'organization');

  if (isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* --- STATS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Roles" value={stats.total} icon={Shield} color="indigo-100" textColor="indigo-600" />
        <StatCard label="System Roles" value={stats.system} icon={Lock} color="orange-100" textColor="orange-600" />
        <StatCard label="Custom Roles" value={stats.custom} icon={ShieldCheck} color="emerald-100" textColor="emerald-600" />
        <StatCard label="Total Users" value={stats.users} icon={Users} color="blue-100" textColor="blue-600" />
      </div>

      {/* --- TABS & SEARCH --- */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-slate-200/50 p-1 rounded-lg w-fit">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search roles..."
              className="h-10 w-full sm:w-64 pl-10 pr-4 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* --- SYSTEM ROLES --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-[11px] uppercase tracking-wider px-1">
            <Lock size={12} />
            SYSTEM ROLES <span className="bg-slate-200/50 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">{systemRoles.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemRoles.map((role: any) => (
              <RoleCard 
                key={role._id} 
                role={role} 
                onEdit={() => setEditingRole(role)}
              />
            ))}
          </div>
        </section>

        {/* --- CUSTOM ROLES --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-[11px] uppercase tracking-wider px-1">
            <ShieldCheck size={12} />
            CUSTOM ROLES <span className="bg-slate-200/50 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">{customRoles.length}</span>
          </div>
          
          {customRoles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                <Shield size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-700">No custom roles yet</h3>
                <p className="text-sm text-slate-400 max-w-[280px]">Create custom roles with specific permissions for your team</p>
              </div>
              <Button onClick={() => setIsCreating(true)} className="bg-slate-900 h-10 px-6 rounded-lg">
                <Plus size={18} className="mr-2" /> Create First Role
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customRoles.map((role: any) => (
                <RoleCard 
                  key={role._id} 
                  role={role} 
                  onEdit={() => setEditingRole(role)} 
                />
              ))}
              <button 
                onClick={() => setIsCreating(true)}
                className="group border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-slate-400 hover:bg-white transition-all cursor-pointer min-h-[180px]"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform">
                  <Plus size={18} />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Add New Role</span>
              </button>
            </div>
          )}
        </section>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {(editingRole || isCreating) && (
          <RoleModal 
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

// --- SUB-COMPONENTS ---

function StatCard({ label, value, icon: Icon, color, textColor }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `bg-${color}`)}>
        <Icon className={cn("w-5 h-5", `text-${textColor}`)} />
      </div>
      <div>
        <h4 className="text-xl font-bold text-slate-800">{value}</h4>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
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
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
      )}
    >
      <Icon size={14} className={active ? "text-blue-600" : "text-slate-400"} />
      {label}
    </button>
  );
}

function RoleCard({ role, onEdit }: any) {
  const permCount = role.permissions?.reduce((acc: number, p: any) => acc + p.actions.length, 0) || 0;
  const resourceCount = role.permissions?.length || 0;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: role.color || '#4F46E5' }} />
      
      <div className="p-5 space-y-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${role.color || '#4F46E5'}10` }}
            >
              <Shield size={20} style={{ color: role.color || '#4F46E5' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 capitalize text-sm">{role.role.replace(/_/g, ' ')}</h3>
                <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded font-bold uppercase tracking-wide">
                  {role.context}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">{role.role}</p>
            </div>
          </div>
          <button onClick={onEdit} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
            <Edit2 size={15} />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 min-h-[32px]">
          {role.description || 'Custom role with defined authorizations.'}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          {role.role === 'super_admin' ? (
             <span className="text-red-600 text-[10px] font-bold uppercase tracking-wider">Full Access</span>
          ) : (
            <span className="text-[10px] font-semibold text-slate-400">
              {resourceCount} Resources · {permCount} Actions
            </span>
          )}
          <button onClick={onEdit} className="text-blue-600 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 hover:underline">
            Manage <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleModal({ role, isNew, onClose, onSave, onDelete, isSaving }: { 
  role: any; 
  isNew: boolean; 
  onClose: () => void; 
  onSave: (data: any) => void; 
  onDelete: (id: string) => void; 
  isSaving: boolean; 
}) {
  const [formData, setFormData] = useState({
    role: role?.role || '',
    description: role?.description || '',
    context: role?.context || 'organization',
    color: role?.color || BADGE_COLORS[0],
    permissions: role?.permissions || []
  });

  const [expandedGroups, setExpandedGroups] = useState<string[]>(RESOURCE_GROUPS.map(g => g.id));

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

  const isChecked = (resId: string, action: string) => {
    const block = formData.permissions.find((p: any) => p.resource === resId);
    return block?.actions.includes(action) || block?.actions.includes('*');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Shield size={20} /></div>
             <div>
                <h2 className="font-bold text-slate-800">{isNew ? 'Create New Role' : `Edit ${role?.role}`}</h2>
                <p className="text-[11px] text-slate-400">Configure access levels and identity</p>
             </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded text-slate-400"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Role Identifier *</label>
              <input 
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                disabled={!isNew && role?.role === 'super_admin'}
                className="w-full h-10 px-4 rounded-lg border border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                placeholder="e.g. org_manager"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Assign Badge Color</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {BADGE_COLORS.map(c => (
                  <button key={c} onClick={() => setFormData({ ...formData, color: c })} className={cn("w-6 h-6 rounded-full transition-all ring-offset-2", formData.color === c && "ring-2 ring-slate-400")} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-20 p-4 rounded-lg border border-slate-200 bg-slate-50 focus:border-blue-500 outline-none transition-all text-sm resize-none"
              placeholder="What access does this role provide?"
            />
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-slate-800">Resource Permissions</h3>
                <button onClick={() => setFormData({ ...formData, permissions: [] })} className="text-xs text-blue-600 font-semibold hover:underline">Clear selection</button>
             </div>
             <div className="space-y-3">
                {RESOURCE_GROUPS.map(group => {
                  const Icon = group.icon;
                  const isExpanded = expandedGroups.includes(group.id);
                  return (
                    <div key={group.id} className="border border-slate-100 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => setExpandedGroups(isExpanded ? expandedGroups.filter(id => id !== group.id) : [...expandedGroups, group.id])}
                        className="w-full px-4 py-2.5 bg-slate-50/50 flex items-center justify-between text-slate-600 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2">
                           <Icon size={14} />
                           <span className="text-[10px] font-bold uppercase tracking-wider">{group.name}</span>
                        </div>
                        <ChevronDown size={14} className={cn("transition-transform", isExpanded && "rotate-180")} />
                      </button>
                      
                      {isExpanded && (
                        <div className="divide-y divide-slate-50">
                          {group.resources.map(res => (
                            <div key={res.id} className="p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                 <span className="text-xs font-bold text-slate-700">{res.label}</span>
                                 <div className="text-[10px] font-mono text-slate-400">{res.id}</div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {ACTIONS.map(action => (
                                  <button
                                    key={action.id}
                                    onClick={() => toggleAction(res.id, action.id)}
                                    className={cn(
                                      "h-9 px-3 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all",
                                      isChecked(res.id, action.id) ? "bg-slate-900 border-slate-900 text-white" : "border-slate-100 hover:border-slate-300 text-slate-400"
                                    )}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        <div className="p-6 border-t bg-slate-50 flex items-center justify-between">
          {!isNew && role?.role !== 'super_admin' ? (
            <button onClick={() => onDelete(role._id)} className="text-red-500 text-[10px] font-bold uppercase tracking-wider hover:underline">Remove Role</button>
          ) : <div />}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="h-10 text-[11px] font-bold uppercase tracking-wide">Cancel</Button>
            <Button onClick={() => onSave(formData)} disabled={isSaving || !formData.role} className="h-10 px-6 rounded-lg bg-blue-600 text-white font-bold text-[11px] uppercase tracking-wide">
              {isSaving ? <RefreshCcw size={16} className="animate-spin mr-2" /> : <ShieldCheck size={16} className="mr-2" />}
              {isNew ? 'Create Role' : 'Update Role'}
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
      <RefreshCcw className="w-6 h-6 text-blue-600 animate-spin" />
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading Authorizations...</p>
    </div>
  );
}
