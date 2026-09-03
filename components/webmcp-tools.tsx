'use client';
import { useEffect } from 'react';
import { questions } from '@/lib/content';
import { loadProgress, summarizeProgress } from '@/lib/progress';

type WebMcpTool = { name: string; title?: string; description: string; inputSchema: object; annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean }; execute(input: unknown): unknown | Promise<unknown> };
declare global { interface Document { readonly modelContext?: { registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }): void | Promise<void> } } }

export function WebMcpTools() {
  useEffect(() => {
    const context = document.modelContext; if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: WebMcpTool) => { try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined); } catch { /* unsupported preview */ } };
    register({ name: 'get_learning_progress', title: '读取学习进度', description: '读取当前浏览器中 AidenICV 题库的掌握度统计。', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute() { const summary = summarizeProgress(questions, loadProgress()); return { total: questions.length, ...summary, practiced: summary.known + summary.fuzzy + summary.unknown }; } });
    register({ name: 'start_practice', title: '开始面试刷题', description: '按主题和题量打开 AidenICV 面试练习。', inputSchema: { type: 'object', properties: { topic: { type: 'string', enum: ['all', 'sv', 'uvm', 'axi', 'weak'] }, count: { type: 'integer', enum: [10, 20, 50] }, order: { type: 'string', enum: ['random', 'sequential'] } }, additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute(input) { if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('输入必须是对象'); const value = input as { topic?: string; count?: number; order?: string; [key: string]: unknown }; if (Object.keys(value).some((key) => !['topic', 'count', 'order'].includes(key))) throw new Error('包含未知字段'); const topic = value.topic ?? 'all'; const count = value.count ?? 10; const order = value.order ?? 'random'; if (!['all', 'sv', 'uvm', 'axi', 'weak'].includes(topic) || ![10, 20, 50].includes(count) || !['random', 'sequential'].includes(order)) throw new Error('无效的练习参数'); const url = `/practice?topics=${topic}&count=${count}&order=${order}`; window.location.assign(url); return { status: 'opening', url }; } });
    return () => lifecycle.abort();
  }, []);
  return null;
}
