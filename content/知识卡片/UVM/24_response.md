---
title: "UVM · response"
description: "response 是 driver 返回数据/状态的可选路径，需正确 ID、兼容类型和明确消费，与请求握手完成分别管理。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# response

[[知识卡片/UVM/index|返回知识网络总入口]] · 运行与激励

## 核心结论

response 是 driver 返回数据/状态的可选路径，需正确 ID、兼容类型和明确消费，与请求握手完成分别管理。

## 关键机制

- item_done(rsp) 附带响应，或完成后单独 put_response(rsp)，同一响应不要重复发送。
- 新 rsp 用 set_id_info(req) 保留 sequence/transaction ID。
- get_response 或启用 response_handler，选择一致策略。
- 默认队列容量有限，不消费会溢出；流水化需未决数与 ID 匹配约定。

## 小例子或流程

```systemverilog
// driver采集结果后
rsp = bus_rsp::type_id::create("rsp");
rsp.set_id_info(req);
rsp.data = sampled_data;
seq_item_port.item_done(rsp);
// 发起sequence中
get_response(rsp);
```
假设双方 REQ/RSP 已一致配置，接收变量为 bus_rsp。

## 易错点

- item_done() 不附 rsp，不会满足 get_response。
- 复用仍被持有的 rsp 会覆盖结果。
- RAL provides_responses 要匹配真实返回策略。

## 关联知识

- [[知识卡片/UVM/07_driver与virtual_interface|driver与virtual_interface]]：driver 采集结果后回填请求或发送响应。
- [[知识卡片/UVM/19_请求握手|请求握手]]：item 完成和响应获取要分别追踪。
- [[知识卡片/UVM/27_前门_adapter与总线链路|前门_adapter与总线链路]]：provides_responses 必须对应实际响应方式。

## 原文出处与已有面试题

- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#67-response-的使用-高|第 6 章 · 6.7 response 的使用（🔴 高）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#693-sequence-调试清单-中|第 6 章 · 6.9.3 sequence 调试清单（🟡 中）]]
- [[学习笔记/UVM/面试八股#30-driver-如何向-sequence-返回-rspresponse-机制|八股 Q30 · driver 如何向 sequence 返回 rsp？（response 机制）]]
