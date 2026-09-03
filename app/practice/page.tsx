import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PracticeClient } from '@/components/practice-client';
export const metadata: Metadata = { title: '面试刷题' };
export default function PracticePage() { return <Suspense fallback={<main className="shell practice-page"><div className="practice-empty">正在准备题目…</div></main>}><PracticeClient /></Suspense>; }
