---
title: "UVM · reference、model与scoreboard"
description: "model 根据规格预测，scoreboard 匹配并比较期望与实际。分离预测和匹配，更利于处理延迟、复用和错误定位。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# reference_model与scoreboard

[[知识卡片/UVM/index|返回知识网络总入口]] · 平台与对象

## 核心结论

model 根据规格预测，scoreboard 匹配并比较期望与实际。分离预测和匹配，更利于处理延迟、复用和错误定位。

## 关键机制

- 模型通常依据输入 monitor 的有效观测生成期望。
- 有序链路可顺序比较，乱序链路需 ID/键与未决表。
- 两条 FIFO 缓存 expected/actual，由 task 等待比较。
- 结束还要检查缺失结果、残留队列与未完成请求。

## 小例子或流程

```text
input monitor → model → expected FIFO ┐
                                      ├→ 匹配 → 比较
output monitor → actual FIFO ──────────┘
```
第n项对第n项只适用于协议保证对应顺序的场景。

## 易错点

- 缺少 actual 导致没有 compare 错误，不代表通过。
- 复位要清模型、队列与旧事务归属。
- write 不能等待另一侧数据，要入队后由 task 处理。

## 关联知识

- [[知识卡片/UVM/01_UVM方法学与平台全貌|UVM方法学与平台全貌]]：预测和比较将观测转成验证结论。
- [[知识卡片/UVM/08_monitor|monitor]]：输入/输出观测支撑期望生成与结果比较。
- [[知识卡片/UVM/13_analysis广播|analysis广播]]：scoreboard 可订阅 analysis 观测流。
- [[知识卡片/UVM/14_TLM_FIFO|TLM_FIFO]]：FIFO 将采样与耗时比较解耦。
- [[知识卡片/UVM/16_objection|objection]]：结束条件包含检查完成和未决项清空。
- [[知识卡片/UVM/29_期望值_镜像值与预测|期望值_镜像值与预测]]：model 可提供硬件计数器的独立预测。

## 原文出处与已有面试题

- [[学习笔记/UVM/02-验证平台搭建与测试用例#235-加入-reference-model-高|第 2 章 · 2.3.5 加入 reference model（🔴 高）]]
- [[学习笔记/UVM/02-验证平台搭建与测试用例#236-加入-scoreboard-高|第 2 章 · 2.3.6 加入 scoreboard（🔴 高）]]
- [[学习笔记/UVM/04-TLM通信与端口连接#433-使用-fifo-通信-高|第 4 章 · 4.3.3 使用 FIFO 通信（🔴 高）]]
