import path from 'node:path';
import { createHash } from 'node:crypto';

const QUESTION_FILES = new Map([
  ['sv学习笔记/sv_八股.md', 'sv'],
  ['uvm学习笔记/uvm_八股.md', 'uvm'],
  ['axi学习笔记/axi_八股.md', 'axi'],
]);

const TYPE_LABELS = {
  notes: '学习笔记',
  interview: '面经',
  written: '笔试',
  coding: '手撕题',
  scenario: '场景设计',
  book: '面试书',
  tools: '开发工具',
  overview: '知识库说明',
};

export function toPosix(input) {
  return input.split(path.sep).join('/');
}

export function slugify(relativePath) {
  const bare = relativePath.replace(/\.md$/i, '').normalize('NFKC');
  const readable = bare.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const hash = createHash('sha1').update(relativePath).digest('hex').slice(0, 8);
  return `${readable || 'article'}-${hash}`;
}

export function headingId(title) {
  return title.normalize('NFKC').toLowerCase().replace(/[`*_]/g, '').replace(/[^\p{Letter}\p{Number}]+/gu, '-').replace(/^-+|-+$/g, '');
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`|~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(markdown, relativePath) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || path.posix.basename(relativePath, '.md');
}

function classify(relativePath) {
  if (relativePath === 'README.md') return { type: 'overview', topic: 'overview' };
  if (relativePath.startsWith('面经/')) return { type: 'interview', topic: 'interview' };
  if (relativePath.startsWith('笔试/')) return { type: 'written', topic: 'written' };
  if (relativePath.startsWith('手撕/')) return { type: 'coding', topic: 'coding' };
  if (relativePath.startsWith('场景/')) return { type: 'scenario', topic: 'scenario' };
  if (relativePath.startsWith('面试书_')) return { type: 'book', topic: 'book' };
  if (relativePath.startsWith('Linux-')) return { type: 'tools', topic: 'tools' };
  if (relativePath.startsWith('sv学习笔记/')) return { type: 'notes', topic: 'sv' };
  if (relativePath.startsWith('uvm学习笔记/')) return { type: 'notes', topic: 'uvm' };
  if (relativePath.startsWith('axi学习笔记/')) return { type: 'notes', topic: 'axi' };
  return { type: 'notes', topic: 'other' };
}

function sectionBetween(block, start, end) {
  const startIndex = block.indexOf(start);
  if (startIndex < 0) return '';
  const contentStart = startIndex + start.length;
  const endIndex = end ? block.indexOf(end, contentStart) : -1;
  return block.slice(contentStart, endIndex >= 0 ? endIndex : undefined).trim();
}

export function parseQuestions(markdown, relativePath) {
  const topic = QUESTION_FILES.get(relativePath);
  if (!topic) return [];
  const matches = [...markdown.matchAll(/^###\s+(\d+)\.\s+(.+)$/gm)];
  const seen = new Set();
  return matches.map((match, index) => {
    const number = Number(match[1]);
    if (seen.has(number)) throw new Error(`${relativePath}: duplicate question ${number}`);
    seen.add(number);
    const block = markdown.slice(match.index, matches[index + 1]?.index ?? markdown.length);
    const answer = sectionBetween(block, '**参考答案**', null).replace(/\n---\s*$/m, '').trim();
    if (!answer) throw new Error(`${relativePath}: question ${number} is missing 参考答案`);
    const beforeQuestion = markdown.slice(0, match.index);
    const section = [...beforeQuestion.matchAll(/^##\s+(.+)$/gm)].at(-1)?.[1]?.replace(/（Q\d+-Q\d+）/, '').trim() || topic.toUpperCase();
    const sources = sectionBetween(block, '**题目来源**', '**考点**')
      .split('\n')
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
    const focus = sectionBetween(block, '**考点**', '**参考答案**')
      .split('\n')
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
    return {
      id: `${topic}-q${number}`,
      number,
      title: match[2].trim(),
      topic,
      section,
      focus,
      answer,
      sources,
      sourcePath: relativePath,
    };
  });
}

export function parseArticle(markdown, relativePath) {
  const { type, topic } = classify(relativePath);
  const title = extractTitle(markdown, relativePath);
  const toc = [...markdown.matchAll(/^(##|###)\s+(.+)$/gm)].map((match) => ({
    depth: match[1].length,
    title: match[2].trim(),
    id: headingId(match[2].trim()),
  }));
  const plain = stripMarkdown(markdown);
  return {
    slug: slugify(relativePath),
    title,
    type,
    typeLabel: TYPE_LABELS[type],
    topic,
    excerpt: plain.slice(0, 170),
    searchText: `${title} ${TYPE_LABELS[type]} ${topic} ${plain}`.toLowerCase(),
    body: markdown,
    toc,
    sourcePath: relativePath,
  };
}

export function rewriteMarkdownLinks(article, slugByPath) {
  const baseDir = path.posix.dirname(article.sourcePath);
  return article.body.replace(/\]\(([^)#]+\.md)(#[^)]+)?\)/gi, (full, target, hash = '') => {
    if (/^https?:/i.test(target)) return full;
    const resolved = path.posix.normalize(path.posix.join(baseDir, decodeURIComponent(target)));
    const slug = slugByPath.get(resolved);
    return slug ? `](/library/${slug}${hash})` : full;
  });
}

export { QUESTION_FILES };
