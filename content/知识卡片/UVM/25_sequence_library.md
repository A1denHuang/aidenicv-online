---
title: "UVM · sequence library"
description: "sequence library 按算法和次数组合候选场景，适合随机回归；不自动保证覆盖，也不代替复现记录。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# sequence_library

[[知识卡片/UVM/index|返回知识网络总入口]] · 运行与激励

## 核心结论

sequence library 按算法和次数组合候选场景，适合随机回归；不自动保证覆盖，也不代替复现记录。

## 关键机制

- 定义、注册并加入候选，创建库不等于收集全部业务场景。
- 选择模式控制随机/随机循环/用户策略等，次数控制运行规模。
- 候选仍要匹配 sequencer、REQ/RSP 和配置。
- 记录种子、候选集合与策略，以 coverage 和统计反馈评估遗漏。

## 小例子或流程

```text
普通读 / 普通写 / 边界访问
           ↓ 算法与次数
   library.start(bus_sqr)
           ↓
    依选择结果执行场景
```
精确多接口时序适合 virtual sequence，库侧重选择跑什么。

## 易错点

- 随机选择不等于所有目标覆盖。
- 成员与配置接口有版本差异，按原文核对。
- 候选仍需统一 objection 拥有方式。

## 关联知识

- [[知识卡片/UVM/18_sequence与sequencer|sequence与sequencer]]：library 将普通 sequence 组成候选集合。
- [[知识卡片/UVM/22_virtual_sequence|virtual_sequence]]：精确时序编排与随机选择有不同用途。

## 原文出处与已有面试题

- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#681-随机选择-sequence-进阶|第 6 章 · 6.8.1 随机选择 sequence（🟢 进阶）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#682-控制选择算法-进阶|第 6 章 · 6.8.2 控制选择算法（🟢 进阶）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#683-控制执行次数-进阶|第 6 章 · 6.8.3 控制执行次数（🟢 进阶）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#684-使用-sequence_library_cfg-进阶|第 6 章 · 6.8.4 使用 `sequence_library_cfg`（🟢 进阶）]]
