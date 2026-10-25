---
title: "UVM · 寄存器内建测试与常用API"
description: "内建 sequence 复用路径、reset 值和位读写检查，执行前需确认状态、副作用与排除项；通用测试不等于业务功能验证。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# 寄存器内建测试与常用API

[[知识卡片/UVM/index|返回知识网络总入口]] · 寄存器与复用

## 核心结论

内建 sequence 复用路径、reset 值和位读写检查，执行前需确认状态、副作用与排除项；通用测试不等于业务功能验证。

## 关键机制

- `uvm_reg_mem_hdl_paths_seq` 检查 HDL 路径，`uvm_reg_hw_reset_seq` 检查复位值，`uvm_reg_bit_bash_seq` 逐位读写寄存器。
- DUT 要真正处于已知复位状态，仅模型 reset 不够。
- volatile、保留位、RC/W1C、命令触发和受锁字段要配置属性并排除不适用测试。
- get_root_blocks 发现根，get_reg_by_offset 按 map 查询；多 map 和读写别名要保留方向上下文。

## 小例子或流程

| 目的 | API |
|---|---|
| 访问真实寄存器 | read / write |
| 目标设置后按需写 | set / update |
| 查模型值 | get / get_mirrored_value |
| 读回比较预测 | mirror |
| 直接后门观察/设置 | peek / poke |
| 只更新模型 | predict / reset |

## 易错点

- bit bash 不应无约束触发 DMA 或清中断。
- 找到对象不代表前门已连接。
- 处理 status 与预测失败，不只看 fatal。

## 关联知识

- [[知识卡片/UVM/26_RAL模型结构|RAL模型结构]]：内建测试和查询依赖正确的模型。
- [[知识卡片/UVM/28_后门与HDL路径|后门与HDL路径]]：HDL path 测试检查后门可达性。
- [[知识卡片/UVM/29_期望值_镜像值与预测|期望值_镜像值与预测]]：使用 API 前先区分模型值与硬件值。

## 原文出处与已有面试题

- [[学习笔记/UVM/07-RAL寄存器模型与前后门访问#76-寄存器模型中一些内建的-sequence-中|第 7 章 · 7.6 寄存器模型中一些内建的 sequence（🟡 中）]]
- [[学习笔记/UVM/07-RAL寄存器模型与前后门访问#78-寄存器模型的其他常用函数-中|第 7 章 · 7.8 寄存器模型的其他常用函数（🟡 中）]]
- [[学习笔记/UVM/07-RAL寄存器模型与前后门访问#791-从寄存器规格到-ral-低|第 7 章 · 7.9.1 从寄存器规格到 RAL（🟢 低）]]
