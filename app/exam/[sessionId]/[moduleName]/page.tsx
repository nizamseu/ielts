'use client';

import { use } from 'react';
import { ExamContainer } from '@/app/(student)/learn/exam/ExamContainer';

interface ExamModulePageProps {
  params: Promise<{ sessionId: string; moduleName: string }>;
}

export default function ExamModulePage({ params }: ExamModulePageProps) {
  const { sessionId, moduleName } = use(params);

  return (
    <ExamContainer
      sessionId={sessionId}
      moduleName={moduleName}
    />
  );
}
