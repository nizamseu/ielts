import { ReactNode } from 'react';

// Full-screen layout for exam taking — no padding, no header nav
export default function ExamSessionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
