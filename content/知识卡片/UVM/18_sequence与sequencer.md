---
title: "UVM · sequence 与 sequencer"
description: "sequence 描述激励内容和顺序，sequencer 仲裁并转发请求；前者是 object，后者是 component，driver 才负责真实时序。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# sequence与sequencer

[[知识卡片/UVM/index|返回知识网络总入口]] · 运行与激励

## 核心结论

sequence 描述激励内容和顺序，sequencer 仲裁并转发请求；前者是 object，后者是 component，driver 才负责真实时序。

## 关键机制

- create 后 seq.start(sqr)，start 通常等待整段 sequence 结束。
- body 创建发送 item，REQ/RSP 约定需与 sequencer/driver 兼容。
- default_sequence 按 sequencer 的某个 phase 配置自动启动；显式 start 更易跟踪控制关系。

## 小例子或流程

```systemverilog
// test中，省略外层objection管理
seq = my_sequence::type_id::create("seq");
seq.start(env.agt.sqr);
```
start 启动整段 sequence，start_item/finish_item 在 body 内发送一笔 item，是不同层级。

## 易错点

- create 不自动执行 body。
- 普通发 item 的 sequence 要有正确 sequencer；纯编排场景要另行取得底层句柄。
- default_sequence/starting_phase 示例有 UVM 1.1d 背景。

## 关联知识

- [[知识卡片/UVM/02_object与component|object与component]]：sequence 是 object，sequencer 是 component。
- [[知识卡片/UVM/05_test与启动流程|test与启动流程]]：test 显式或配置默认 sequence 启动场景。
- [[知识卡片/UVM/15_phase|phase]]：sequence 要在合适阶段启动并存活到完成。
- [[知识卡片/UVM/16_objection|objection]]：sequence 运行要有明确场景拥有者。
- [[知识卡片/UVM/19_请求握手|请求握手]]：sequence 将场景细化为 item 发送。
- [[知识卡片/UVM/20_仲裁与lock_grab|仲裁与lock_grab]]：多个 sequence 共用 sequencer 时需要仲裁。
- [[知识卡片/UVM/21_sequence生命周期与宏|sequence生命周期与宏]]：start 和宏决定回调与发送路径。
- [[知识卡片/UVM/22_virtual_sequence|virtual_sequence]]：高层编排复用普通 sequence 的动作。
- [[知识卡片/UVM/23_sequence配置与sequencer句柄|sequence配置与sequencer句柄]]：绑定 sequencer 后获得类型与配置上下文。
- [[知识卡片/UVM/25_sequence_library|sequence_library]]：library 将普通 sequence 组成候选集合。
- [[知识卡片/UVM/27_前门_adapter与总线链路|前门_adapter与总线链路]]：RAL 复用总线 sequencer 的调度和发送机制。

## 原文出处与已有面试题

- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#611-从-driver-中剥离激励产生功能-高|第 6 章 · 6.1.1 从 driver 中剥离激励产生功能（🔴 高）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#612-sequence-的启动与执行-高|第 6 章 · 6.1.2 sequence 的启动与执行（🔴 高）]]
- [[学习笔记/UVM/02-验证平台搭建与测试用例#243-default_sequence-的使用-高|第 2 章 · 2.4.3 default_sequence 的使用（🔴 高）]]
- [[学习笔记/UVM/面试八股#22-seqstart-与-start_itemfinish_item-的区别|八股 Q22 · seq.start() 与 start_item/finish_item 的区别？]]
- [[学习笔记/UVM/面试八股#26-使用-uvm_do-宏时-sequence-会不会阻塞|八股 Q26 · 使用 uvm_do 宏时 sequence 会不会阻塞？]]
