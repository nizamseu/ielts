"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export function RequireRole({
  children,
  allowedRoles,
  fallbackRoute
}: {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackRoute: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/login");
        return;
      }
      
      // Default missing roles to 'student' so they don't accidentally bypass admin checks
      const userRole = session?.user?.role || 'student';

      if (!allowedRoles.includes(userRole)) {
        router.replace(fallbackRoute);
      }
    }
  }, [session, isPending, router, allowedRoles, fallbackRoute, pathname]);

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-[#0a0f1c]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Double check before rendering
  const userRole = session?.user?.role || 'student';
  if (session && allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  // Prevent flash of content
  return null;
}
