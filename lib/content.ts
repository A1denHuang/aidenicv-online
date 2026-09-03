import questionsData from '@/app/data/questions.json';

export type Topic = 'sv' | 'uvm' | 'axi';
export type Question = { id: string; number: number; title: string; topic: Topic; section: string; focus: string[]; answer: string; sources: string[]; sourcePath: string };
export const questions = questionsData as Question[];
export const topicMeta: Record<Topic, { label: string; description: string; tone: string }> = {
  sv: { label: 'SystemVerilog', description: '数据类型、随机化、并发与覆盖率', tone: 'blue' },
  uvm: { label: 'UVM', description: '平台架构、TLM、phase 与 sequence', tone: 'violet' },
  axi: { label: 'AMBA / AXI', description: '握手、乱序、burst 与协议验证', tone: 'cyan' },
};
