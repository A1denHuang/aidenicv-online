---
title: "UVM · UVM方法学与平台全貌"
description: "UVM 用统一的创建、配置、通信和运行机制，将激励、驱动、观测、预测和检查组织成可复用平台。先理解数据流，再记组件名字。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# UVM方法学与平台全貌

[[知识卡片/UVM/index|返回知识网络总入口]] · 平台与对象

## 核心结论

UVM 用统一的创建、配置、通信和运行机制，将激励、驱动、观测、预测和检查组织成可复用平台。先理解数据流，再记组件名字。

## 关键机制

- sequence 描述场景，sequencer 仲裁请求，driver 转成接口时序。
- 输入 monitor 观察真实接收，reference model 计算期望，输出 monitor 提供实际结果，scoreboard 匹配比较。
- config_db 决定参数，factory 决定实现类型，phase 决定何时创建、连接与运行。
- SystemVerilog 提供随机化等语言能力，UVM 提供平台组织方法。

## 小例子或流程

```text
sequence → sequencer → driver → DUT
输入monitor → model → 期望 ┐
输出monitor ───────→ 实际 ┴→ scoreboard
```

## 易错点

- 计划发送不等于 DUT 已接收，检查依赖真实观测。
- 有组件框架仍需验证目标、检查规则与覆盖反馈。

## 关联知识

- [[知识卡片/UVM/02_object与component|object与component]]：区分对象与组件才能理解角色的生命周期。
- [[知识卡片/UVM/05_test与启动流程|test与启动流程]]：test 将平台角色组织成可执行场景。
- [[知识卡片/UVM/06_env与agent|env与agent]]：env/agent 是协议和结构的封装边界。
- [[知识卡片/UVM/09_reference_model与scoreboard|reference_model与scoreboard]]：预测和比较将观测转成验证结论。

## 原文出处与已有面试题

- [[学习笔记/UVM/01-UVM概念与验证方法学#14-为什么有了-systemverilog-还需要方法学-低|第 1 章 · 1.4 为什么有了 SystemVerilog 还需要方法学（🟢 低）]]
- [[学习笔记/UVM/01-UVM概念与验证方法学#15-对方法学的三层理解-低|第 1 章 · 1.5 对“方法学”的三层理解（🟢 低）]]
- [[学习笔记/UVM/02-验证平台搭建与测试用例#21-验证平台的组成-高|第 2 章 · 2.1 验证平台的组成（🔴 高）]]
- [[学习笔记/UVM/面试八股#1-验证平台的基本组成是什么各组件之间如何配合|八股 Q1 · 验证平台的基本组成是什么？各组件之间如何配合？]]
