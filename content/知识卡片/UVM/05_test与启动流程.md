---
title: "UVM · test与启动流程"
description: "run_test 选择并创建 test，test 组合环境、设置配置与替换策略，并启动场景。新 test 通常复用相同 env。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# test与启动流程

[[知识卡片/UVM/index|返回知识网络总入口]] · 平台与对象

## 核心结论

run_test 选择并创建 test，test 组合环境、设置配置与替换策略，并启动场景。新 test 通常复用相同 env。

## 关键机制

- top module 连接静态 DUT/interface，在 run_test 前设置 vif。
- +UVM_TESTNAME 选择已注册且进入编译范围的 test，实例通常叫 uvm_test_top。
- build 创建环境和配置，connect 连接 TLM，运行阶段 start sequence。
- 场景拥有者持有 objection，直到激励与检查均完成。

## 小例子或流程

```systemverilog
// test的main_phase片段
my_sequence seq;
phase.raise_objection(this);
seq = my_sequence::type_id::create("seq");
seq.start(env.agt.sqr);
wait (env.scb.all_done); // 平台自行实现的完成标志
phase.drop_objection(this);
```

## 易错点

- 建树与连接依赖 phase，不是在选择 test 名字时一并完成。
- start 返回不等于 scoreboard 排空。
- 为完成条件设置独立 timeout，避免无限等待。

## 关联知识

- [[知识卡片/UVM/01_UVM方法学与平台全貌|UVM方法学与平台全貌]]：test 将平台角色组织成可执行场景。
- [[知识卡片/UVM/15_phase|phase]]：run_test 创建 test，phase 组织后续运行。
- [[知识卡片/UVM/16_objection|objection]]：test 通常能统一判断激励与检查完成。
- [[知识卡片/UVM/18_sequence与sequencer|sequence与sequencer]]：test 显式或配置默认 sequence 启动场景。
- [[知识卡片/UVM/31_factory注册_创建与override|factory注册_创建与override]]：test 在创建目标前设置替换策略。

## 原文出处与已有面试题

- [[学习笔记/UVM/02-验证平台搭建与测试用例#25-建造测试用例-高|第 2 章 · 2.5 建造测试用例（🔴 高）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#612-sequence-的启动与执行-高|第 6 章 · 6.1.2 sequence 的启动与执行（🔴 高）]]
- [[学习笔记/UVM/面试八股#3-run_test-是如何启动整个-uvm-平台的|八股 Q3 · run_test() 是如何启动整个 UVM 平台的？]]
- [[学习笔记/UVM/面试八股#17-uvm-phase-的总体执行顺序与-run_test-的起点|八股 Q17 · UVM phase 的总体执行顺序与 run_test 的起点]]
