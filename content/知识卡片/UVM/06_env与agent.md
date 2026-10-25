---
title: "UVM · env与agent"
description: "agent 封装一个协议接口的驱动与观测，env 组合多个 agent 与检查组件。active/passive 是模块到系统复用的重要边界。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# env与agent

[[知识卡片/UVM/index|返回知识网络总入口]] · 平台与对象

## 核心结论

agent 封装一个协议接口的驱动与观测，env 组合多个 agent 与检查组件。active/passive 是模块到系统复用的重要边界。

## 关键机制

- active agent 通常创建 sqr、drv、mon 并连接请求通路。
- passive agent 通常只保留 mon，观察由其他 master 驱动的接口。
- env 创建 model、scoreboard 和通道，在 connect_phase 连接。
- 协议能力放 agent，跨接口场景放 test/virtual sequence。

## 小例子或流程

```text
env
├── input_agent：active（sqr+drv+mon）
├── output_agent：passive（mon）
├── reference_model
└── scoreboard
```
模式配置应在决定是否创建 drv/sqr 前生效。

## 易错点

- passive agent 不应继续驱动 DUT。
- 外部不应依赖 agent 所有内部路径。
- 芯片级重复 monitor 会导致同一事务重复检查。

## 关联知识

- [[知识卡片/UVM/01_UVM方法学与平台全貌|UVM方法学与平台全貌]]：env/agent 是协议和结构的封装边界。
- [[知识卡片/UVM/07_driver与virtual_interface|driver与virtual_interface]]：active agent 创建并连接 driver/sequencer。
- [[知识卡片/UVM/08_monitor|monitor]]：passive agent 保留观测能力。
- [[知识卡片/UVM/12_TLM与port_export_imp|TLM与port_export_imp]]：封装层以 TLM 接口暴露事务通路。
- [[知识卡片/UVM/33_参数化与平台复用|参数化与平台复用]]：active/passive 支持系统集成复用。

## 原文出处与已有面试题

- [[学习笔记/UVM/02-验证平台搭建与测试用例#232-加入-env-高|第 2 章 · 2.3.2 加入 env（🔴 高）]]
- [[学习笔记/UVM/02-验证平台搭建与测试用例#234-封装成-agent-高|第 2 章 · 2.3.4 封装成 agent（🔴 高）]]
- [[学习笔记/UVM/09-Callback回调与平台复用#941-基于-env-的重用-低|第 9 章 · 9.4.1 基于 env 的重用（🟢 低）]]
- [[学习笔记/UVM/面试八股#4-agent-是什么包含哪些组件可以配置什么|八股 Q4 · agent 是什么？包含哪些组件？可以配置什么？]]
