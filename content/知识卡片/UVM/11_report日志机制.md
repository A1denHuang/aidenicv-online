---
title: "UVM · report日志机制"
description: "report 分开管理严重性、详细程度、ID 和处理动作。日志消失或过多时，分别检查过滤规则与 action。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# report日志机制

[[知识卡片/UVM/index|返回知识网络总入口]] · 配置与通信

## 核心结论

report 分开管理严重性、详细程度、ID 和处理动作。日志消失或过多时，分别检查过滤规则与 action。

## 关键机制

- severity 为 INFO/WARNING/ERROR/FATAL；verbosity 为 NONE/LOW/MEDIUM/HIGH/FULL/DEBUG 等详细级别。
- INFO 是否显示由有效阈值决定，阈值越高允许更详细的信息。
- 可按组件、ID 定向设置阈值、动作、输出文件。
- action 控制显示、记录、计数、退出；severity override 改分类，并非同一种过滤。

## 小例子或流程

```systemverilog
`uvm_info("DRV_REQ",req.sprint(),UVM_HIGH)
`uvm_error("SCB_MISMATCH","expected and actual differ")
```
第一条未显示查 verbosity；第二条后退出要查 action、quit count 等退出原因。

## 易错点

- HIGH 更详细，不是更严重。
- 局部设置与递归设置影响范围不同。
- 退出计数及部分 hier 接口存在教材版本提示，按项目 API 核对。

## 关联知识

- [[知识卡片/UVM/10_config_db|config_db]]：配置 trace 和日志共同定位配置失败。
- [[知识卡片/UVM/15_phase|phase]]：phase trace 与 timeout 定位阶段停滞。
- [[知识卡片/UVM/19_请求握手|请求握手]]：节点日志帮助定位握手阻塞环节。

## 原文出处与已有面试题

- [[学习笔记/UVM/03-组件层次与config_db配置#34-uvm-中打印信息的控制-中|第 3 章 · 3.4 UVM 中打印信息的控制（🟡 中）]]
- [[学习笔记/UVM/面试八股#7-uvm_info-的消息等级分类|八股 Q7 · uvm_info 的消息等级分类]]
