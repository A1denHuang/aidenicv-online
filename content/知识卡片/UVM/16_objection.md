---
title: "UVM · objection"
description: "objection 表示某 task phase 仍有工作未完成，由能判断整个场景完成的拥有者成对 raise/drop，防止提前退出或永久挂起。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# objection

[[知识卡片/UVM/index|返回知识网络总入口]] · 运行与激励

## 核心结论

objection 表示某 task phase 仍有工作未完成，由能判断整个场景完成的拥有者成对 raise/drop，防止提前退出或永久挂起。

## 关键机制

- 对同一 phase 保持 source/计数配对，各阶段独立。
- test 或顶层 virtual sequence 常适合作为拥有者，永久驱动/观测循环不适合。
- 最后 item 后 DUT/scoreboard 仍可能未排空，应等明确完成条件。
- drain time 留尾部处理时间，固定延时不证明完整性。
- 教材 starting_phase 有版本背景，手动 start 不一定自动赋有效阶段。

## 小例子或流程

```systemverilog
// test运行阶段片段
phase.raise_objection(this);
seq.start(env.agt.sqr);
wait (env.scb.all_done); // 平台实现：预期结果齐全且未决项清空
phase.drop_objection(this);
```
以独立 timeout 处理缺失响应，避免无限等待。

## 易错点

- 无法退出的 forever 会让 drop 不可达。
- 子 sequence 的 pre_body/post_body 可能被跳过。
- +UVM_OBJECTION_TRACE 定位持有者，区分漏 drop 与 drop 太早。

## 关联知识

- [[知识卡片/UVM/05_test与启动流程|test与启动流程]]：test 通常能统一判断激励与检查完成。
- [[知识卡片/UVM/09_reference_model与scoreboard|reference_model与scoreboard]]：结束条件包含检查完成和未决项清空。
- [[知识卡片/UVM/15_phase|phase]]：task phase 的持续时间与 objection 相关。
- [[知识卡片/UVM/18_sequence与sequencer|sequence与sequencer]]：sequence 运行要有明确场景拥有者。
- [[知识卡片/UVM/21_sequence生命周期与宏|sequence生命周期与宏]]：启动方式跳过回调会影响 objection 管理。
- [[知识卡片/UVM/22_virtual_sequence|virtual_sequence]]：顶层编排可统一管理多接口场景存活。

## 原文出处与已有面试题

- [[学习笔记/UVM/05-Phase调度与Objection控制#521-objection-与-task-phase-高|第 5 章 · 5.2.1 objection 与 task phase（🔴 高）]]
- [[学习笔记/UVM/05-Phase调度与Objection控制#523-控制-objection-的最佳选择-高|第 5 章 · 5.2.3 控制 objection 的最佳选择（🔴 高）]]
- [[学习笔记/UVM/05-Phase调度与Objection控制#524-set_drain_time-的使用-中|第 5 章 · 5.2.4 set_drain_time 的使用（🟡 中）]]
- [[学习笔记/UVM/05-Phase调度与Objection控制#525-objection-的调试-中|第 5 章 · 5.2.5 objection 的调试（🟡 中）]]
- [[学习笔记/UVM/面试八股#21-uvm-的-objection-机制是什么有什么用|八股 Q21 · UVM 的 objection 机制是什么？有什么用？]]
