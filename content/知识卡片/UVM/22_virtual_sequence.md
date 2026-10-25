---
title: "UVM · virtual、sequence"
description: "virtual sequence 组合普通 sequence 协调多个接口；virtual sequencer 通常保存底层句柄，不需要真实引脚 driver。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# virtual_sequence

[[知识卡片/UVM/index|返回知识网络总入口]] · 运行与激励

## 核心结论

virtual sequence 组合普通 sequence 协调多个接口；virtual sequencer 通常保存底层句柄，不需要真实引脚 driver。

## 关键机制

- env/connect 设置底层句柄，也可直接注入 virtual sequence。
- 顺序 start 表达先后，fork/join 表达并发，精确同步需要事件与完成条件。
- 每个并发线程用独立对象，不同时 start/randomize 同一 sequence。
- test/顶层 virtual sequence 统一管理 objection，子 sequence 负责可复用动作。

## 小例子或流程

```systemverilog
// 两对象已独立创建，p_sequencer类型已声明且句柄有效
fork
  rd_seq.start(p_sequencer.rd_sqr);
  wr_seq.start(p_sequencer.wr_sqr);
join
```
join 等待两个场景结束，检查链路排空仍要另行确认。

## 易错点

- 不会自动发现底层通道。
- join_none 后立刻 drop 可能让后台场景被阶段结束终止。
- chip 通常重组编排，复用普通 sequence。

## 关联知识

- [[知识卡片/UVM/16_objection|objection]]：顶层编排可统一管理多接口场景存活。
- [[知识卡片/UVM/18_sequence与sequencer|sequence与sequencer]]：高层编排复用普通 sequence 的动作。
- [[知识卡片/UVM/23_sequence配置与sequencer句柄|sequence配置与sequencer句柄]]：多接口编排需要正确的底层句柄。
- [[知识卡片/UVM/25_sequence_library|sequence_library]]：精确时序编排与随机选择有不同用途。
- [[知识卡片/UVM/33_参数化与平台复用|参数化与平台复用]]：系统级重组编排，复用底层动作。

## 原文出处与已有面试题

- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#65-virtual-sequence-的使用-高|第 6 章 · 6.5 virtual sequence 的使用（🔴 高）]]
- [[学习笔记/UVM/09-Callback回调与平台复用#943-virtual-sequence-与-virtual-sequencer-中|第 9 章 · 9.4.3 virtual sequence 与 virtual sequencer（🟡 中）]]
- [[学习笔记/UVM/面试八股#28-virtual-sequence-是什么和普通-sequence-有什么区别如何协调多个-sequencer|八股 Q28 · virtual sequence 是什么？和普通 sequence 有什么区别？如何协调多个 sequencer？]]
