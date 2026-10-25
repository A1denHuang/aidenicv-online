---
title: "UVM · phase"
description: "phase 统一组织创建、连接、运行和检查。function phase 不耗时，task phase 可耗时，结束由阶段控制与 objection 决定。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# phase

[[知识卡片/UVM/index|返回知识网络总入口]] · 运行与激励

## 核心结论

phase 统一组织创建、连接、运行和检查。function phase 不耗时，task phase 可耗时，结束由阶段控制与 objection 决定。

## 关键机制

- 常见顺序：build → connect → end_of_elaboration → start_of_simulation → 运行 → extract → check → report → final。
- build 自顶向下，其他常见 function phase 自底向上，不依赖兄弟组件先后。
- run_phase 与 reset/configure/main/shutdown 等12个运行阶段组成的 schedule 并行，不是 run 完才 main。
- 同一 task phase 的组件任务并发，结束时未完成任务可能被终止。
- +UVM_PHASE_TRACE 与 timeout 用于定位阶段停滞。

## 小例子或流程

```text
build：配置与建树
connect：端口连接
run与run-time schedule：驱动、观测、场景并发
extract/check/report：收集、检查遗漏、报告
```

## 易错点

- forever 或延时不保证 phase 保持运行。
- 保留用户父类必要逻辑，不机械假定所有 super.phase 实现相同。
- 原文5.1.5标注“未理解，待复习，先跳过”，此卡保留待复习状态，不将内部细节视为已确认。

## 关联知识

- [[知识卡片/UVM/03_组件树与实例路径|组件树与实例路径]]：phase 按各自规则遍历组件树。
- [[知识卡片/UVM/05_test与启动流程|test与启动流程]]：run_test 创建 test，phase 组织后续运行。
- [[知识卡片/UVM/11_report日志机制|report日志机制]]：phase trace 与 timeout 定位阶段停滞。
- [[知识卡片/UVM/16_objection|objection]]：task phase 的持续时间与 objection 相关。
- [[知识卡片/UVM/17_domain与phase跳转|domain与phase跳转]]：domain/jump 改变动态阶段流程。
- [[知识卡片/UVM/18_sequence与sequencer|sequence与sequencer]]：sequence 要在合适阶段启动并存活到完成。

## 原文出处与已有面试题

- [[学习笔记/UVM/05-Phase调度与Objection控制#511-task-phase-与-function-phase-高|第 5 章 · 5.1.1 task phase 与 function phase（🔴 高）]]
- [[学习笔记/UVM/05-Phase调度与Objection控制#513-phase-的执行顺序-高|第 5 章 · 5.1.3 phase 的执行顺序（🔴 高）]]
- [[学习笔记/UVM/05-Phase调度与Objection控制#515-superphase-的内容️-未理解待复习先跳过|第 5 章 · 5.1.5 super.phase 的内容（⚠️ 未理解，待复习，先跳过）]]
- [[学习笔记/UVM/面试八股#13-uvm_component-的生命周期|八股 Q13 · uvm_component 的生命周期]]
- [[学习笔记/UVM/面试八股#16-uvm-的-phase-分为哪两大类|八股 Q16 · UVM 的 phase 分为哪两大类？]]
- [[学习笔记/UVM/面试八股#17-uvm-phase-的总体执行顺序与-run_test-的起点|八股 Q17 · UVM phase 的总体执行顺序与 run_test 的起点]]
- [[学习笔记/UVM/面试八股#18-run_phase-与-main_phase-的区别|八股 Q18 · run_phase 与 main_phase 的区别]]
- [[学习笔记/UVM/面试八股#19-为什么-build_phase-是自顶向下执行|八股 Q19 · 为什么 build_phase 是自顶向下执行？]]
