import articleIndexData from '@/app/data/article-index.json';
import type { Article } from '@/lib/articles';
export type ArticleIndex = Omit<Article, 'body' | 'toc'>;
export const articleIndex = articleIndexData as ArticleIndex[];
