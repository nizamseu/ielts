'use client';

import { useSession } from '@/lib/auth-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="flex items-center gap-x-4 animate-pulse">
        <div className="hidden lg:flex lg:flex-col lg:items-end gap-1">
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-2 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  const user = session?.user;
  const userName = user?.name || 'Guest User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-x-4 outline-none rounded-full focus-visible:ring-2 focus-visible:ring-blue-500/50 hover:opacity-80 transition-opacity">
        <span className="hidden lg:flex lg:flex-col lg:items-end">
          <span className="text-sm font-bold leading-tight text-slate-900 dark:text-slate-200" aria-hidden="true">
            {userName}
          </span>
          {user && (
            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {((user as unknown) as { role?: string })?.role?.replace('_', ' ') || 'User'}
            </span>
          )}
        </span>
        <div className="h-9 w-9 rounded-full bg-linear-to-tr from-blue-600 to-cyan-500 shadow-sm p-[2px]">
          <div className="h-full w-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{userInitial}</p>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl dark:bg-slate-900">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{userName}</p>
            <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
              {user?.email || 'No email provided'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 gap-2 font-medium">
          <Link href="/dashboard/profile">
            <UserIcon className="h-4 w-4 text-slate-500" />
            Profile Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={async () => {
            await authClient.signOut();
            router.push('/login');
          }}
          className="cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 focus:bg-red-50 dark:focus:bg-red-500/10 text-red-600 focus:text-red-600 gap-2 font-medium mt-1"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
