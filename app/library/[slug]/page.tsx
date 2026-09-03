import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import { articles } from '@/lib/articles';
import { MarkdownRenderer } from '@/components/markdown-renderer';

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const article = articles.find((item) => item.slug === slug); return article ? { title: article.title, description: article.excerpt } : {}; }
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const article = articles.find((item) => item.slug === slug); if (!article) notFound(); const sourceUrl = `https://github.com/qingxuanxx/sv_uvm_axi_notes/blob/main/${article.sourcePath.split('/').map(encodeURIComponent).join('/')}`; return <main className="article-page shell"><div className="article-breadcrumb"><Link href="/library"><ArrowLeft /> 返回知识库</Link><span>/</span><span>{article.typeLabel}</span></div><div className="article-layout"><article className="article-content"><header><span className="article-type"><FileText /> {article.typeLabel}</span><h1>{article.title}</h1><p>{article.sourcePath}</p></header><MarkdownRenderer markdown={article.body} /><div className="source-box"><div><strong>内容来源</strong><span>本文内容来自 sv_uvm_axi_notes 开源知识库，按 MIT License 使用。</span></div><a href={sourceUrl} target="_blank" rel="noreferrer">查看原文 <ExternalLink /></a></div></article>{article.toc.length > 1 && <aside className="article-toc"><strong>本页目录</strong><nav>{article.toc.slice(0, 24).map((item, index) => <a key={`${item.id}-${index}`} href={`#${item.id}`} className={item.depth === 3 ? 'nested' : ''}>{item.title}</a>)}</nav></aside>}</div></main>; }
