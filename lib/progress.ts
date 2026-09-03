import type { Question } from '@/lib/content';
export const PROGRESS_KEY = 'aidenicv.progress.v1';
export type Mastery = 'known' | 'fuzzy' | 'unknown';
export type ProgressEntry = { mastery: Mastery; attempts: number; lastSeen: string };
export type ProgressState = Record<string, ProgressEntry>;
export function loadProgress(): ProgressState { if (typeof window === 'undefined') return {}; try { const value = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; } }
export function saveRating(state: ProgressState, questionId: string, mastery: Mastery): ProgressState { const next = { ...state, [questionId]: { mastery, attempts: (state[questionId]?.attempts || 0) + 1, lastSeen: new Date().toISOString() } }; window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); window.dispatchEvent(new Event('aidenicv-progress')); return next; }
export function clearProgress() { window.localStorage.removeItem(PROGRESS_KEY); window.dispatchEvent(new Event('aidenicv-progress')); }
export function summarizeProgress(items: Question[], state: ProgressState) { return items.reduce((summary, question) => { const mastery = state[question.id]?.mastery; if (mastery) summary[mastery] += 1; return summary; }, { known: 0, fuzzy: 0, unknown: 0 }); }
