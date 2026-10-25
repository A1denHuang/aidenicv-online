---
title: "UVM · domain与phase跳转"
description: "domain 分离组件组的动态阶段，jump 改变阶段流程，却不会自动将 DUT、事务与模型恢复到一致状态。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# domain与phase跳转

[[知识卡片/UVM/index|返回知识网络总入口]] · 运行与激励

## 核心结论

domain 分离组件组的动态阶段，jump 改变阶段流程，却不会自动将 DUT、事务与模型恢复到一致状态。

## 关键机制

- 普通平台先用默认 domain，确需独立 reset/main 流程再增加。
- jump 影响当前 domain 动态流程，不只影响调用组件；公共 function phase 不会因此完全隔离。
- 恢复要协调 req/rsp、锁、FIFO、未决表、RAL 和 objection。
- 定义旧事务取消/失效规则及重新启动责任。

## 小例子或流程

```text
复位 → 协调停止旧场景与未决事务
     → jump到reset → 初始化接口/模型
     → 配置 → 新场景
```
jump 只是调度动作，清理避免重复 drop 与遗留锁。

## 易错点

- grab 不能中断 driver 已接收的 item。
- 旧 FIFO 数据会造成跨复位误匹配。
- 不必要的 domain 增加同步成本。

## 关联知识

- [[知识卡片/UVM/14_TLM_FIFO|TLM_FIFO]]：阶段重入需处理旧事务缓存。
- [[知识卡片/UVM/15_phase|phase]]：domain/jump 改变动态阶段流程。
- [[知识卡片/UVM/20_仲裁与lock_grab|仲裁与lock_grab]]：复位要协调独占锁和未完成请求。
- [[知识卡片/UVM/29_期望值_镜像值与预测|期望值_镜像值与预测]]：复位后 DUT 与模型需重新同步。

## 原文出处与已有面试题

- [[学习笔记/UVM/05-Phase调度与Objection控制#517-phase-的跳转-高|第 5 章 · 5.1.7 phase 的跳转（🔴 高）]]
- [[学习笔记/UVM/05-Phase调度与Objection控制#53-domain-的应用-低|第 5 章 · 5.3 domain 的应用（🟢 低）]]
- [[学习笔记/UVM/面试八股#20-运行中检测到复位如何跳回-reset_phasephase-jump|八股 Q20 · 运行中检测到复位，如何跳回 reset_phase？（phase jump）]]
