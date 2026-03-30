'use client';

import { useSession } from '@/lib/auth-client';

export function UserMenu() {
  const { data: session, isPending } = useSession();

  const userName = session?.user?.name || 'Admin User';
  const userInitial = isPending ? '...' : userName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-x-4">
      <span className="hidden lg:flex lg:flex-col lg:items-end">
        <span className="text-sm font-bold leading-tight text-slate-900 dark:text-slate-200" aria-hidden="true">
          {userName}
        </span>
        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          {(session?.user as any)?.role?.replace('_', ' ') || 'Admin'}
        </span>
      </span>
      <div className="h-9 w-9 rounded-full bg-linear-to-tr from-blue-600 to-cyan-500 shadow-sm p-[2px]">
        <div className="h-full w-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{userInitial}</p>
        </div>
      </div>
    </div>
  );
}
