---
title: "UVM · factory注册、创建与override"
description: "factory 在创建时选实际类型，让平台通过派生类替换实现。注册给入口，create 查工厂，override 必须早于目标创建。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# factory注册_创建与override

[[知识卡片/UVM/index|返回知识网络总入口]] · 寄存器与复用

## 核心结论

factory 在创建时选实际类型，让平台通过派生类替换实现。注册给入口，create 查工厂，override 必须早于目标创建。

## 关键机制

- 对应 utils 注册，type_id::create 应用规则，直接 new 不应用 override。
- type override 面向类型，instance override 按创建上下文路径限定范围，同次查询实例规则通常优先。
- 优先 by-type，by-name 依赖字符串；参数化类要注意名称支持限制。
- 若 super.build 创建目标，先 override 再 super，按父类逻辑判断。
- factory 改实现，config 改参数，sequence 约束改数据。

## 小例子或流程

```systemverilog
// test build_phase，任何目标packet创建前
packet::type_id::set_type_override(error_packet::get_type());
// 后续仍按基类创建
req = packet::type_id::create("req");
```
error_packet 继承 packet，基类稳定接口和 virtual 方法支持正确分派。

## 易错点

- 已有对象不会因后来 override 改类型。
- 同名方法不天然多态，要正确 virtual。
- 查路径、直接 new、特化与实际类型，结合 factory 打印。

## 关联知识

- [[知识卡片/UVM/02_object与component|object与component]]：两类对象有不同注册和创建约定。
- [[知识卡片/UVM/03_组件树与实例路径|组件树与实例路径]]：instance override 匹配创建上下文路径。
- [[知识卡片/UVM/05_test与启动流程|test与启动流程]]：test 在创建目标前设置替换策略。
- [[知识卡片/UVM/10_config_db|config_db]]：改参数与替换实现类型需要不同机制。
- [[知识卡片/UVM/32_callback|callback]]：整套替换和钩子扩展适合不同粒度。
- [[知识卡片/UVM/33_参数化与平台复用|参数化与平台复用]]：参数化类需要正确特化、注册和按类型替换。

## 原文出处与已有面试题

- [[学习笔记/UVM/08-Factory注册与类型覆盖#82-使用-factory-机制进行重载-高|第 8 章 · 8.2 使用 factory 机制进行重载（🔴 高）]]
- [[学习笔记/UVM/08-Factory注册与类型覆盖#844-factory-机制的本质-高|第 8 章 · 8.4.4 factory 机制的本质（🔴 高）]]
- [[学习笔记/UVM/08-Factory注册与类型覆盖#851-设置-override-的时机-低|第 8 章 · 8.5.1 设置 override 的时机（🟢 低）]]
- [[学习笔记/UVM/08-Factory注册与类型覆盖#852-factory-与-config_db-的分工-低|第 8 章 · 8.5.2 factory 与 config_db 的分工（🟢 低）]]
