import articlesData from '@/app/data/articles.json';
export type Article = { slug: string; title: string; type: string; typeLabel: string; topic: string; excerpt: string; searchText: string; body: string; toc: Array<{ depth: number; title: string; id: string }>; sourcePath: string };
export const articles = articlesData as Article[];
