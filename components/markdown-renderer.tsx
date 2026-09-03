'use client';
import { Children, type ReactNode, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

function textOf(node: ReactNode): string { if (typeof node === 'string' || typeof node === 'number') return String(node); if (Array.isArray(node)) return node.map(textOf).join(''); if (node && typeof node === 'object' && 'props' in node) return textOf((node as { props: { children?: ReactNode } }).props.children); return ''; }
function anchorId(value: ReactNode) { return textOf(value).normalize('NFKC').toLowerCase().replace(/[`*_]/g, '').replace(/[^\p{Letter}\p{Number}]+/gu, '-').replace(/^-+|-+$/g, ''); }
function CodeBlock({ children }: { children?: ReactNode }) { const [copied, setCopied] = useState(false); const text = textOf(children).replace(/\n$/, ''); return <div className="code-block"><button type="button" onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1200); }} aria-label="复制代码">{copied ? <Check /> : <Copy />}{copied ? '已复制' : '复制'}</button><pre>{Children.toArray(children)}</pre></div>; }
export function MarkdownRenderer({ markdown }: { markdown: string }) { return <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h1: ({ children }) => <h1 id={anchorId(children)}>{children}</h1>, h2: ({ children }) => <h2 id={anchorId(children)}>{children}</h2>, h3: ({ children }) => <h3 id={anchorId(children)}>{children}</h3>, pre: ({ children }) => <CodeBlock>{children}</CodeBlock>, a: ({ href, children }) => <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noreferrer' : undefined}>{children}</a>, img: ({ alt }) => alt ? <span className="image-alt">{alt}</span> : null }}>{markdown}</ReactMarkdown></div>; }
