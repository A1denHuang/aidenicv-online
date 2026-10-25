---
title: "UVM · 仲裁与 lock/grab"
description: "仲裁解决同一 sequencer 的争用，lock/grab 申请独占。grab 影响后续授权，不能抢断已执行的总线事务。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# 仲裁与lock_grab

[[知识卡片/UVM/index|返回知识网络总入口]] · 运行与激励

## 核心结论

仲裁解决同一 sequencer 的争用，lock/grab 申请独占。grab 影响后续授权，不能抢断已执行的总线事务。

## 关键机制

- 多个 sequence 可并发 start，item 顺序由策略决定；普通 FIFO 模式不会因设置 priority 自动变抢占。
- lock 正常排队，grab 将请求放队列前部，两者可能等待已有持有者释放。
- 持有者及允许的子 sequence 可发送，其他竞争者等待。
- unlock/ungrab 释放，异常与复位也纳入清理。

## 小例子或流程

```systemverilog
// body片段，req已创建且不被其他线程复用
lock();
repeat (4) begin
  start_item(req);
  if (!req.randomize()) `uvm_fatal("RAND","randomization failed")
  finish_item(req);
end
unlock();
```
仅约束该 sequencer，不等于锁住 DUT 或其他 master。

## 易错点

- 持锁等另一个被此锁挡住的 sequence 会死锁。
- 优先级不保证跨 sequencer 原子性。
- 缩短独占范围以避免饥饿。

## 关联知识

- [[知识卡片/UVM/17_domain与phase跳转|domain与phase跳转]]：复位要协调独占锁和未完成请求。
- [[知识卡片/UVM/18_sequence与sequencer|sequence与sequencer]]：多个 sequence 共用 sequencer 时需要仲裁。
- [[知识卡片/UVM/19_请求握手|请求握手]]：start_item 授权受仲裁和锁影响。

## 原文出处与已有面试题

- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#621-在同一-sequencer-上启动多个-sequence-中|第 6 章 · 6.2.1 在同一 sequencer 上启动多个 sequence（🟡 中）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#622-sequencer-的-lock-操作-中|第 6 章 · 6.2.2 sequencer 的 lock 操作（🟡 中）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#623-sequencer-的-grab-操作-中|第 6 章 · 6.2.3 sequencer 的 grab 操作（🟡 中）]]
