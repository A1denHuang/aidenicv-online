'use client';
import { ArrowRight, BookMarked, FileCode2, Search, SlidersHorizontal } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { articleIndex } from '@/lib/article-index';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const filters = [{ value: 'all', label: '全部内容' }, { value: 'notes', label: '学习笔记' }, { value: 'interview', label: '面经' }, { value: 'book', label: '面试书' }, { value: 'written', label: '笔试' }, { value: 'coding', label: '手撕题' }, { value: 'scenario', label: '场景设计' }, { value: 'tools', label: '开发工具' }];
const topicLabels: Record<string, string> = { all: '全部主题', sv: 'SystemVerilog', uvm: 'UVM', axi: 'AMBA / AXI', interview: '面经', book: '综合基础', tools: '开发工具' };

export function LibraryClient() {
  const [query, setQuery] = useState(''); const [type, setType] = useState('all'); const [topic, setTopic] = useState('all'); const deferred = useDeferredValue(query.trim().toLowerCase());
  const results = useMemo(() => { const terms = deferred.split(/\s+/).filter(Boolean); return articleIndex.filter((article) => (type === 'all' || article.type === type) && (topic === 'all' || article.topic === topic) && terms.every((term) => article.searchText.includes(term))); }, [deferred, type, topic]);
  return <main className="library-page shell"><header className="page-heading library-heading"><span className="eyebrow"><BookMarked /> 119 篇整理内容</span><h1>数字 IC 验证知识库</h1><p>从基础概念到公司面经，在一个地方查找 SystemVerilog、UVM、AMBA 协议与面试准备资料。</p></header>
    <section className="search-panel"><div className="search-box"><Search /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索知识点、协议、公司或面试题…" aria-label="搜索知识库" /></div><div className="library-filters"><SlidersHorizontal /><Select value={type} onValueChange={(value) => setType(value as string)}><SelectTrigger><SelectValue>{filters.find((item) => item.value === type)?.label}</SelectValue></SelectTrigger><SelectContent>{filters.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select><Select value={topic} onValueChange={(value) => setTopic(value as string)}><SelectTrigger><SelectValue>{topicLabels[topic]}</SelectValue></SelectTrigger><SelectContent>{Object.entries(topicLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div></section>
    <div className="results-meta"><strong>{results.length}</strong> 篇内容{deferred && <span>匹配“{query}”</span>}</div>
    {results.length ? <section className="article-grid">{results.map((article) => <a key={article.slug} href={`/library/${article.slug}`} className="article-card"><div className="article-card-top"><span>{article.typeLabel}</span><FileCode2 /></div><h2>{article.title}</h2><p>{article.excerpt || '打开查看完整内容。'}</p><footer><span>{article.sourcePath.split('/')[0]}</span><span>阅读全文 <ArrowRight /></span></footer></a>)}</section> : <div className="library-empty"><Search /><h2>没有找到相关内容</h2><p>试试缩短关键词，或切换内容类型和主题。</p></div>}
  </main>;
}
