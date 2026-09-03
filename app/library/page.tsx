import type { Metadata } from 'next';
import { LibraryClient } from '@/components/library-client';
export const metadata: Metadata = { title: '知识库' };
export default function LibraryPage() { return <LibraryClient />; }
