import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArticle, parseQuestions, rewriteMarkdownLinks, toPosix } from '../lib/content-parser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'content', 'upstream');
const outputRoot = path.join(root, 'app', 'data');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

if (!fs.existsSync(sourceRoot)) throw new Error(`Missing content source: ${sourceRoot}`);
const markdownFiles = walk(sourceRoot).filter((file) => file.endsWith('.md')).sort();
const articles = [];
const questions = [];

for (const file of markdownFiles) {
  const relativePath = toPosix(path.relative(sourceRoot, file));
  const markdown = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  articles.push(parseArticle(markdown, relativePath));
  questions.push(...parseQuestions(markdown, relativePath));
}

const slugByPath = new Map(articles.map((article) => [article.sourcePath, article.slug]));
for (const article of articles) article.body = rewriteMarkdownLinks(article, slugByPath);

fs.mkdirSync(outputRoot, { recursive: true });
fs.writeFileSync(path.join(outputRoot, 'questions.json'), `${JSON.stringify(questions, null, 2)}\n`);
fs.writeFileSync(path.join(outputRoot, 'articles.json'), `${JSON.stringify(articles, null, 2)}\n`);
fs.writeFileSync(path.join(outputRoot, 'article-index.json'), `${JSON.stringify(articles.map(({ body, toc, ...article }) => article), null, 2)}\n`);
console.log(`Generated ${questions.length} questions and ${articles.length} articles.`);
