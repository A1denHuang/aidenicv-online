---
title: "UVM · callback"
description: "callback 在组件预留钩子处安装扩展动作，适合稳定流程的小变化；仅安装对象而无调用点，不会执行。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# callback

[[知识卡片/UVM/index|返回知识网络总入口]] · 寄存器与复用

## 核心结论

callback 在组件预留钩子处安装扩展动作，适合稳定流程的小变化；仅安装对象而无调用点，不会执行。

## 关键机制

- 定义 callback 基类/虚方法，在组件注册对应类型。
- 组件在指定位置用宏或迭代调用钩子，扩展类实现动作。
- 创建并 add 到目标实例，在首次钩子执行前安装。
- 多 callback 改同一事务时定义副作用和顺序。
- 小钩子用 callback，整套实现用 factory，激励组合用 sequence，参数用 config。

## 小例子或流程

```text
安装error_inject到目标driver
          ↓
取req → pre_drive钩子 → 协议驱动 → post_drive钩子
           ↓
      按需求修改或记录事务
```
钩子名与签名由 VIP 设计者预先定义。

## 易错点

- 查注册、add 实例、安装时机与真正调用点。
- function 钩子不能加入时间等待。
- 不用大量钩子模拟互斥的整套算法。

## 关联知识

- [[知识卡片/UVM/31_factory注册_创建与override|factory注册_创建与override]]：整套替换和钩子扩展适合不同粒度。
- [[知识卡片/UVM/33_参数化与平台复用|参数化与平台复用]]：稳定钩子允许 VIP 用户不修改驱动主体。

## 原文出处与已有面试题

- [[学习笔记/UVM/09-Callback回调与平台复用#913-uvm-中-callback-机制的原理-中|第 9 章 · 9.1.3 UVM 中 callback 机制的原理（🟡 中）]]
- [[学习笔记/UVM/09-Callback回调与平台复用#914-callback-机制的使用-中|第 9 章 · 9.1.4 callback 机制的使用（🟡 中）]]
- [[学习笔记/UVM/09-Callback回调与平台复用#917-callbacksequence-和-factory-的选择-中|第 9 章 · 9.1.7 callback、sequence 和 factory 的选择（🟡 中）]]
