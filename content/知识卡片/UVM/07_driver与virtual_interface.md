---
title: "UVM · driver 与 virtual interface"
description: "driver 将 transaction 转为引脚时序，virtual interface 让 class 访问静态 interface 实例，共同连接事务层与引脚层。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# driver与virtual_interface

[[知识卡片/UVM/index|返回知识网络总入口]] · 平台与对象

## 核心结论

driver 将 transaction 转为引脚时序，virtual interface 让 class 访问静态 interface 实例，共同连接事务层与引脚层。

## 关键机制

- top module 实例化 interface，通过 config_db 传 vif。
- driver 在 build 获取并检查 vif，agent 在 connect 连接 seq_item_port。
- 运行中处理时钟、背压与复位，采集结果后在约定时机完成 item。
- vif 本身不自动实现协议，采样与驱动规则要由实现明确。

## 小例子或流程

```systemverilog
// build_phase，已声明virtual bus_if vif
if (!uvm_config_db#(virtual bus_if)::get(this,"","vif",vif))
  `uvm_fatal("NOVIF", "virtual interface missing")
// 运行task
seq_item_port.get_next_item(req);
drive_one(req); // 用户实现
seq_item_port.item_done();
```

## 易错点

- interface 参数与 modport 特化需匹配。
- 漏 item_done 会阻塞，过早完成会改变所有权与完成含义。
- 永久驱动循环不适合持有无法释放的测试 objection。

## 关联知识

- [[知识卡片/UVM/06_env与agent|env与agent]]：active agent 创建并连接 driver/sequencer。
- [[知识卡片/UVM/10_config_db|config_db]]：driver 从配置取得 vif 和协议参数。
- [[知识卡片/UVM/19_请求握手|请求握手]]：driver 的取请求/完成通知与发送端配对。
- [[知识卡片/UVM/24_response|response]]：driver 采集结果后回填请求或发送响应。
- [[知识卡片/UVM/27_前门_adapter与总线链路|前门_adapter与总线链路]]：前门最终依赖 driver 执行真实时序。

## 原文出处与已有面试题

- [[学习笔记/UVM/02-验证平台搭建与测试用例#224-加入-virtual-interface-高|第 2 章 · 2.2.4 加入 virtual interface（🔴 高）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#692-get_next_item-与-get-高|第 6 章 · 6.9.2 `get_next_item` 与 `get`（🔴 高）]]
- [[学习笔记/UVM/面试八股#23-driver-与-sequencer-的握手机制|八股 Q23 · driver 与 sequencer 的握手机制？]]
