---
title: "UVM · object与component"
description: "component 也是 object，但额外属于组件树并自动参与 phase。transaction、sequence 和配置对象通常是按需创建的普通 object。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# object与component

[[知识卡片/UVM/index|返回知识网络总入口]] · 平台与对象

## 核心结论

component 也是 object，但额外属于组件树并自动参与 phase。transaction、sequence 和配置对象通常是按需创建的普通 object。

## 关键机制

- uvm_component 经 uvm_report_object 派生自 uvm_object；类型继承树与实例树不同。
- driver、monitor、sequencer、agent、env、test 是 component，构造时需要 name 和 parent。
- sequence 是 object，需显式启动，不自动经历组件 phase。
- 分别用 object_utils/component_utils 注册，构造函数遵守对应约定。

## 小例子或流程

```systemverilog
// 组件build_phase中创建driver，数据对象按需创建
drv = my_driver::type_id::create("drv", this);
tr = packet::type_id::create("tr");
```

## 易错点

- 关联 sequencer 不会让 sequence 变为 component。
- 有名字不等于挂在组件树上。
- component 不能像 transaction 一样随意 copy/clone。

## 关联知识

- [[知识卡片/UVM/01_UVM方法学与平台全貌|UVM方法学与平台全貌]]：区分对象与组件才能理解角色的生命周期。
- [[知识卡片/UVM/03_组件树与实例路径|组件树与实例路径]]：component 以 parent/name 建立实例树。
- [[知识卡片/UVM/04_transaction与字段操作|transaction与字段操作]]：transaction 是需要字段操作的典型 object。
- [[知识卡片/UVM/18_sequence与sequencer|sequence与sequencer]]：sequence 是 object，sequencer 是 component。
- [[知识卡片/UVM/31_factory注册_创建与override|factory注册_创建与override]]：两类对象有不同注册和创建约定。

## 原文出处与已有面试题

- [[学习笔记/UVM/03-组件层次与config_db配置#31-uvm_component-与-uvm_object-高|第 3 章 · 3.1 uvm_component 与 uvm_object（🔴 高）]]
- [[学习笔记/UVM/面试八股#5-uvm_object-与-uvm_component-的区别|八股 Q5 · uvm_object 与 uvm_component 的区别]]
- [[学习笔记/UVM/面试八股#13-uvm_component-的生命周期|八股 Q13 · uvm_component 的生命周期]]
