import test from 'node:test';
import assert from 'node:assert/strict';
import { parseQuestions, slugify } from '../lib/content-parser.mjs';

const sample = `# SV 八股
## 第2章 数据类型（Q1-Q1）
### 1. logic 和 wire 有什么区别？
**题目来源**
- 示例公司
**考点**
- 多驱动
**参考答案**
logic 是变量，wire 是网络。
\`\`\`systemverilog
logic ready;
\`\`\`
---`;

test('parses a structured question including code', () => {
  const [question] = parseQuestions(sample, 'sv学习笔记/sv_八股.md');
  assert.equal(question.id, 'sv-q1');
  assert.equal(question.section, '第2章 数据类型');
  assert.deepEqual(question.focus, ['多驱动']);
  assert.match(question.answer, /logic ready/);
});

test('rejects missing answers', () => {
  assert.throws(
    () => parseQuestions(sample.replace('**参考答案**', '**答案缺失**'), 'sv学习笔记/sv_八股.md'),
    /missing 参考答案/,
  );
});

test('rejects duplicate question numbers', () => {
  assert.throws(
    () => parseQuestions(`${sample}\n${sample.split('## 第2章 数据类型（Q1-Q1）')[1]}`, 'sv学习笔记/sv_八股.md'),
    /duplicate question 1/,
  );
});

test('creates stable readable Chinese slugs', () => {
  assert.match(slugify('sv学习笔记/sv_ch2学习笔记.md'), /^sv-sv-ch2-[a-f0-9]{8}$/);
  assert.equal(slugify('sv学习笔记/sv_ch2学习笔记.md'), slugify('sv学习笔记/sv_ch2学习笔记.md'));
});
