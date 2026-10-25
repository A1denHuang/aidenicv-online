---
title: "UVM · analysis 广播"
description: "analysis_port 用 write function 向零个或多个订阅者广播，适合一份观测同时服务检查、覆盖、预测，不提供耗时等待或自动复制。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# analysis广播

[[知识卡片/UVM/index|返回知识网络总入口]] · 配置与通信

## 核心结论

analysis_port 用 write function 向零个或多个订阅者广播，适合一份观测同时服务检查、覆盖、预测，不提供耗时等待或自动复制。

## 关键机制

- 终点可为 analysis_imp、subscriber 或 analysis FIFO。
- 订阅者 write 在当前调用链执行，不能消耗仿真时间；发布者在函数返回后继续。
- 订阅者共享同一对象句柄，应默认只读，不依赖订阅顺序。
- 耗时处理应 write 入队，再由运行 task 消费。

## 小例子或流程

```systemverilog
mon.ap.connect(scb.imp);
mon.ap.connect(cov.analysis_export);
ap.write(tr); // monitor完成一笔观测后发布
```
假设 cov 派生自 uvm_subscriber，scb 实现匹配的 write。

## 易错点

- 不耗时不等于自动创建后台线程。
- 零订阅者也可能合法，应主动检查链路。
- write 不 clone，发布后改写对象会污染消费者。

## 关联知识

- [[知识卡片/UVM/04_transaction与字段操作|transaction与字段操作]]：广播共享句柄，修改前应理解复制策略。
- [[知识卡片/UVM/08_monitor|monitor]]：monitor 通过 analysis 广播真实观测。
- [[知识卡片/UVM/09_reference_model与scoreboard|reference_model与scoreboard]]：scoreboard 可订阅 analysis 观测流。
- [[知识卡片/UVM/12_TLM与port_export_imp|TLM与port_export_imp]]：analysis 是适合观测广播的 TLM 方式。
- [[知识卡片/UVM/14_TLM_FIFO|TLM_FIFO]]：analysis FIFO 连接不耗时发布与可等待消费。
- [[知识卡片/UVM/29_期望值_镜像值与预测|期望值_镜像值与预测]]：predictor 订阅 analysis 更新寄存器模型。

## 原文出处与已有面试题

- [[学习笔记/UVM/04-TLM通信与端口连接#431-uvm-中的-analysis-端口-高|第 4 章 · 4.3.1 UVM 中的 analysis 端口（🔴 高）]]
- [[学习笔记/UVM/04-TLM通信与端口连接#432-一个-component-内有多个-imp-高|第 4 章 · 4.3.2 一个 component 内有多个 IMP（🔴 高）]]
