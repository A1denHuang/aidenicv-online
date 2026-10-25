---
title: "UVM · sequence生命周期与宏"
description: "显式 start 常见顺序为 pre_start → pre_body → body → post_body → post_start；宏封装创建、随机化与发送，要区分 item 与子 sequence。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# sequence生命周期与宏

[[知识卡片/UVM/index|返回知识网络总入口]] · 运行与激励

## 核心结论

显式 start 常见顺序为 pre_start → pre_body → body → post_body → post_start；宏封装创建、随机化与发送，要区分 item 与子 sequence。

## 关键机制

- call_pre_post 控制 pre_body/post_body，pre_start/post_start 仍为启动包装。
- 宏启动子 sequence 可能跳过 pre_body/post_body，不把全局必要收尾只放其中。
- pre_do/mid_do/post_do 是父 sequence 的发送钩子，与 pre_body 不同。
- uvm_create 创建，uvm_send 不重新随机化，uvm_rand_send 加随机化，uvm_do_with 加约束。

## 小例子或流程

```text
item：uvm_do ≈ create → start_item → randomize → finish_item
子sequence：创建/随机化 → start（带父sequence上下文）
```
卡住时展开宏，区分授权等待、item完成等待和子场景执行。

## 易错点

- 不能把所有宏都解释成同一套四行代码。
- pre_body 不是父 sequence 的 pre_do。
- starting_phase 直接访问方式有教材版本背景。

## 关联知识

- [[知识卡片/UVM/16_objection|objection]]：启动方式跳过回调会影响 objection 管理。
- [[知识卡片/UVM/18_sequence与sequencer|sequence与sequencer]]：start 和宏决定回调与发送路径。
- [[知识卡片/UVM/19_请求握手|请求握手]]：宏的 item 路径封装显式握手。

## 原文出处与已有面试题

- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#612-sequence-的启动与执行-高|第 6 章 · 6.1.2 sequence 的启动与执行（🔴 高）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#631-uvm_do-系列宏-高|第 6 章 · 6.3.1 `uvm_do` 系列宏（🔴 高）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#632-uvm_create-与-uvm_send-高|第 6 章 · 6.3.2 `uvm_create` 与 `uvm_send`（🔴 高）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#635-pre_domid_do-与-post_do-中|第 6 章 · 6.3.5 `pre_do`、`mid_do` 与 `post_do`（🟡 中）]]
- [[学习笔记/UVM/面试八股#24-sequence-的生命周期回调有哪些顺序是什么|八股 Q24 · sequence 的生命周期回调有哪些？顺序是什么？]]
- [[学习笔记/UVM/面试八股#26-使用-uvm_do-宏时-sequence-会不会阻塞|八股 Q26 · 使用 uvm_do 宏时 sequence 会不会阻塞？]]
