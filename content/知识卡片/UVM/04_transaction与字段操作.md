---
title: "UVM · transaction与字段操作"
description: "transaction 是抽象操作的数据载体。字段操作决定复制、比较、打印和打包行为；句柄赋值不会产生独立副本。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# transaction与字段操作

[[知识卡片/UVM/index|返回知识网络总入口]] · 平台与对象

## 核心结论

transaction 是抽象操作的数据载体。字段操作决定复制、比较、打印和打包行为；句柄赋值不会产生独立副本。

## 关键机制

- 常派生自 uvm_sequence_item，包含 rand 字段、约束和协议数据。
- field automation 登记字段，flags 控制参与哪些操作。
- copy 向已有对象复制，clone 创建副本并返回 object 句柄，通常要 $cast。
- 深浅复制由 flags 与实现决定；自定义 do_copy/do_compare 保留父类必要行为。

## 小例子或流程

```systemverilog
packet snapshot;
if (!$cast(snapshot, tr.clone()))
  `uvm_fatal("COPY", "clone type mismatch")
```
嵌套对象也需正确复制。snapshot = tr 仅共享句柄。

## 易错点

- 注册类型不等于全部字段自动参与 compare。
- clone 名称不保证所有嵌套字段深复制。
- 修改已发布的同一对象会污染 FIFO 历史条目。

## 关联知识

- [[知识卡片/UVM/02_object与component|object与component]]：transaction 是需要字段操作的典型 object。
- [[知识卡片/UVM/08_monitor|monitor]]：发布对象需要稳定生命周期。
- [[知识卡片/UVM/13_analysis广播|analysis广播]]：广播共享句柄，修改前应理解复制策略。
- [[知识卡片/UVM/14_TLM_FIFO|TLM_FIFO]]：FIFO 保存句柄，改写会污染历史事务。
- [[知识卡片/UVM/19_请求握手|请求握手]]：握手时机影响 item 安全复用与所有权。

## 原文出处与已有面试题

- [[学习笔记/UVM/02-验证平台搭建与测试用例#231-加入-transaction-高|第 2 章 · 2.3.1 加入 transaction（🔴 高）]]
- [[学习笔记/UVM/03-组件层次与config_db配置#33-field-automation-机制-中|第 3 章 · 3.3 field automation 机制（🟡 中）]]
