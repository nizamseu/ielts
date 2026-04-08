import { OrgSidebar } from '@/components/OrgSidebar';
import { UserMenu } from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0a0f1c] overflow-hidden">
      {/* Sidebar Component */}
      <OrgSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#0f1526]/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1" /> {/* Spacer */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  );
}
