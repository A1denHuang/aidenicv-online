---
title: "UVM · TLM 与 port/export/imp"
description: "TLM 用事务和方法接口通信：port 发起调用，export 暴露/转接接口，imp 将调用落到组件实现，链路最终要有可用实现。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# TLM与port_export_imp

[[知识卡片/UVM/index|返回知识网络总入口]] · 配置与通信

## 核心结论

TLM 用事务和方法接口通信：port 发起调用，export 暴露/转接接口，imp 将调用落到组件实现，链路最终要有可用实现。

## 关键机制

- put/get 传送或获取事务，transport 组合请求与返回；blocking task 可等，nonblocking function 即时返回成功与否。
- export 适合封装层转接，不天然存储数据或实现业务。
- connect_phase 连接，核对事务类型、方法集合与层次方向。
- 需要缓存与速率解耦时使用 FIFO。
- 若改用 mailbox/自定义 TLM 通道绕过 sequencer，需要另外设计并发仲裁、路由和完成通知，不能继续套用 start_item/finish_item 的授权协议。

## 小例子或流程

```systemverilog
producer.put_port.connect(consumer.put_imp);
// producer调用put_port.put(tr)；
// consumer以对应blocking_put_imp绑定task put(packet tr)。
```
经 env 的 export 转接时，仍要接到终端实现。

## 易错点

- get 的调用方向与数据流方向相反。
- 不能凭方法名相似混接 blocking/nonblocking 接口。
- export 不等于实现或缓存。

## 关联知识

- [[知识卡片/UVM/06_env与agent|env与agent]]：封装层以 TLM 接口暴露事务通路。
- [[知识卡片/UVM/13_analysis广播|analysis广播]]：analysis 是适合观测广播的 TLM 方式。
- [[知识卡片/UVM/14_TLM_FIFO|TLM_FIFO]]：FIFO 在方法接口上增加缓存和等待。

## 原文出处与已有面试题

- [[学习笔记/UVM/04-TLM通信与端口连接#41-tlm10-高|第 4 章 · 4.1 TLM1.0（🔴 高）]]
- [[学习笔记/UVM/04-TLM通信与端口连接#422-uvm-中的-imp-中|第 4 章 · 4.2.2 UVM 中的 IMP（🟡 中）]]
- [[学习笔记/UVM/04-TLM通信与端口连接#423-port-与-imp-的连接-中|第 4 章 · 4.2.3 PORT 与 IMP 的连接（🟡 中）]]
- [[学习笔记/UVM/面试八股#14-tlm-中-portexportimp-的区别|八股 Q14 · TLM 中 PORT、EXPORT、IMP 的区别？]]
- [[学习笔记/UVM/面试八股#27-sequence-脱离-sequencer-时如何直接向-driver-发送激励|八股 Q27 · sequence 脱离 sequencer 时，如何直接向 driver 发送激励？]]
