---
title: "UVM · monitor"
description: "monitor 从接口真实活动重建 transaction，为检查、覆盖与预测提供独立观测，应该能在没有 driver 的 passive agent 中工作。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# monitor

[[知识卡片/UVM/index|返回知识网络总入口]] · 平台与对象

## 核心结论

monitor 从接口真实活动重建 transaction，为检查、覆盖与预测提供独立观测，应该能在没有 driver 的 passive agent 中工作。

## 关键机制

- 按有效握手和采样点收集字段，不能仅看到 valid 就认定成功。
- 完整观测形成 transaction，经 analysis_port 发布。
- 输入观测说明实际接收，输出观测说明实际产出。
- 发布后对象只读，下笔创建新对象或生成正确快照。

## 小例子或流程

```text
有效握手 → 收集字段 → 完整transaction → analysis
                                        ↓
                         model / scoreboard / coverage / predictor
```
接口从未握手时，不应根据 driver 意图虚构接收。

## 易错点

- driver 的请求不能替代实际观测。
- monitor 通常不产生激励，也不决定测试结束。
- 复位半包处理要与 model/scoreboard 一致。

## 关联知识

- [[知识卡片/UVM/04_transaction与字段操作|transaction与字段操作]]：发布对象需要稳定生命周期。
- [[知识卡片/UVM/06_env与agent|env与agent]]：passive agent 保留观测能力。
- [[知识卡片/UVM/13_analysis广播|analysis广播]]：monitor 通过 analysis 广播真实观测。
- [[知识卡片/UVM/09_reference_model与scoreboard|reference_model与scoreboard]]：输入/输出观测支撑期望生成与结果比较。
- [[知识卡片/UVM/29_期望值_镜像值与预测|期望值_镜像值与预测]]：总线观测是显式 predictor 的数据来源。

## 原文出处与已有面试题

- [[学习笔记/UVM/02-验证平台搭建与测试用例#233-加入-monitor-高|第 2 章 · 2.3.3 加入 monitor（🔴 高）]]
- [[学习笔记/UVM/04-TLM通信与端口连接#431-uvm-中的-analysis-端口-高|第 4 章 · 4.3.1 UVM 中的 analysis 端口（🔴 高）]]
- [[学习笔记/UVM/面试八股#2-monitor-的作用是什么验证环境能否省略-monitor|八股 Q2 · monitor 的作用是什么？验证环境能否省略 monitor？]]
