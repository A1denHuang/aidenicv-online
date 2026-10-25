---
title: "UVM · TLM FIFO"
description: "FIFO 用缓存解耦生产与消费，让采样和检查按各自节奏运行；它不负责协议匹配，也不自动复制对象。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# TLM_FIFO

[[知识卡片/UVM/index|返回知识网络总入口]] · 配置与通信

## 核心结论

FIFO 用缓存解耦生产与消费，让采样和检查按各自节奏运行；它不负责协议匹配，也不自动复制对象。

## 关键机制

- uvm_tlm_fifo 提供 put/get，有界队列满时 blocking put 等待，空时 get 等待。
- uvm_tlm_analysis_fifo 用不耗时 write 入队、get 消费，是无界缓存。
- expected/actual 各一条 FIFO，适合有序数据由 task 等待比较。
- 检查 used、连接和消费进度，结束与复位时处理残留。

## 小例子或流程

```systemverilog
// env connect_phase
mon.ap.connect(actual_fifo.analysis_export);
// 检查task
actual_fifo.get(actual);
```
消费者等待不使 monitor 的 write 耗时，但长期跟不上时无界缓存持续增长。

## 易错点

- FIFO 不自动支持乱序匹配。
- 条目是句柄，要保证快照稳定。
- flush 不能替代 driver/model/scoreboard 完整恢复。

## 关联知识

- [[知识卡片/UVM/04_transaction与字段操作|transaction与字段操作]]：FIFO 保存句柄，改写会污染历史事务。
- [[知识卡片/UVM/09_reference_model与scoreboard|reference_model与scoreboard]]：FIFO 将采样与耗时比较解耦。
- [[知识卡片/UVM/12_TLM与port_export_imp|TLM与port_export_imp]]：FIFO 在方法接口上增加缓存和等待。
- [[知识卡片/UVM/13_analysis广播|analysis广播]]：analysis FIFO 连接不耗时发布与可等待消费。
- [[知识卡片/UVM/17_domain与phase跳转|domain与phase跳转]]：阶段重入需处理旧事务缓存。

## 原文出处与已有面试题

- [[学习笔记/UVM/04-TLM通信与端口连接#433-使用-fifo-通信-高|第 4 章 · 4.3.3 使用 FIFO 通信（🔴 高）]]
- [[学习笔记/UVM/04-TLM通信与端口连接#434-fifo-上的端口及调试-中|第 4 章 · 4.3.4 FIFO 上的端口及调试（🟡 中）]]
- [[学习笔记/UVM/04-TLM通信与端口连接#435-用-fifo-还是用-imp-高|第 4 章 · 4.3.5 用 FIFO 还是用 IMP（🔴 高）]]
- [[学习笔记/UVM/面试八股#15-验证环境中为什么用-tlm_fifo它解决了什么问题|八股 Q15 · 验证环境中为什么用 tlm_fifo？它解决了什么问题？]]
