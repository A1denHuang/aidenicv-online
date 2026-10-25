---
title: "UVM · 前门、adapter与总线链路"
description: "前门走真实总线：map 解析地址，adapter 转换标准寄存器操作与 bus transaction，sequencer/driver 执行并返回结果。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# 前门_adapter与总线链路

[[知识卡片/UVM/index|返回知识网络总入口]] · 寄存器与复用

## 核心结论

前门走真实总线：map 解析地址，adapter 转换标准寄存器操作与 bus transaction，sequencer/driver 执行并返回结果。

## 关键机制

- reg2bus 生成 bus req，bus2reg 还原地址、方向、数据、status。
- map.set_sequencer(bus_sqr,adapter) 绑定通路，driver/sequencer 端口仍须连接。
- req 内回填结果后完成对应 provides_responses=0，独立 rsp 则为1。
- 核对字节使能、地址单位、宽度、错误码；前门检查真实协议与译码，依赖 bus agent 正常工作。

## 小例子或流程

```text
reg.read → map/address → adapter.reg2bus → bus sequencer
 → driver → DUT → req回填或rsp → adapter.bus2reg
 → data/status返回 → 按预测策略更新模型
```
read 卡住沿此链定位，adapter 本身不驱动引脚。

## 易错点

- 设为1却不返回 rsp 会等待不到结果。
- 前门成功不保证镜像自动更新，仍看预测配置。
- rsp 保存 ID，bus2reg 读取正确对象的数据和错误状态。

## 关联知识

- [[知识卡片/UVM/07_driver与virtual_interface|driver与virtual_interface]]：前门最终依赖 driver 执行真实时序。
- [[知识卡片/UVM/18_sequence与sequencer|sequence与sequencer]]：RAL 复用总线 sequencer 的调度和发送机制。
- [[知识卡片/UVM/24_response|response]]：provides_responses 必须对应实际响应方式。
- [[知识卡片/UVM/26_RAL模型结构|RAL模型结构]]：map 接入 sequencer/adapter 后才能总线前门访问。
- [[知识卡片/UVM/28_后门与HDL路径|后门与HDL路径]]：前门检查总线，后门便于初始化和定位。
- [[知识卡片/UVM/29_期望值_镜像值与预测|期望值_镜像值与预测]]：访问返回和预测需要分别配置检查。

## 原文出处与已有面试题

- [[学习笔记/UVM/07-RAL寄存器模型与前后门访问#722-将寄存器模型集成到验证平台中-高|第 7 章 · 7.2.2 将寄存器模型集成到验证平台中（🔴 高）]]
- [[学习笔记/UVM/07-RAL寄存器模型与前后门访问#731-uvm-中前门访问的实现-高|第 7 章 · 7.3.1 UVM 中前门访问的实现（🔴 高）]]
- [[学习笔记/UVM/07-RAL寄存器模型与前后门访问#793-前门访问故障定位-低|第 7 章 · 7.9.3 前门访问故障定位（🟢 低）]]
