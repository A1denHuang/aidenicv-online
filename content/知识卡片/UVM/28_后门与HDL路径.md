---
title: "UVM · 后门与 HDL 路径"
description: "后门通过 HDL 路径或自定义 backdoor 直接访问内部状态，适合初始化与定位；它不能证明真实总线正确。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# 后门与HDL路径

[[知识卡片/UVM/index|返回知识网络总入口]] · 寄存器与复用

## 核心结论

后门通过 HDL 路径或自定义 backdoor 直接访问内部状态，适合初始化与定位；它不能证明真实总线正确。

## 关键机制

- block 给根路径，reg 用 path slice 映射 RTL 对象与位段。
- read/write(UVM_BACKDOOR) 保留寄存器访问语义，peek/poke 直接观察/deposit，可绕过软件权限。
- 依赖仿真器 HDL 可见性和 DPI/VPI 支持，优化/加密/层次变化可能失效。
- 先验证路径，再核对 slice 宽度、位置与拼接。

## 小例子或流程

```systemverilog
// 构建阶段，ctrl与RTL对象均为8位
rm.configure(null,"top_tb.dut");
rm.ctrl.add_hdl_path_slice("ctrl_reg",0,8);
// 运行阶段
rm.ctrl.peek(status,value);
```
目标 top_tb.dut.ctrl_reg 必须存在且可访问。

## 易错点

- 不与 config_db 组件路径混用。
- poke 不等于软件写，RO/W1C/RC 等需按 API 区分。
- 后门不经总线 monitor，不能期待总线 predictor 自动观测。

## 关联知识

- [[知识卡片/UVM/03_组件树与实例路径|组件树与实例路径]]：组件路径与后门 HDL 路径不能混用。
- [[知识卡片/UVM/26_RAL模型结构|RAL模型结构]]：同一模型通过 HDL path 建立后门。
- [[知识卡片/UVM/27_前门_adapter与总线链路|前门_adapter与总线链路]]：前门检查总线，后门便于初始化和定位。
- [[知识卡片/UVM/30_寄存器内建测试与常用API|寄存器内建测试与常用API]]：HDL path 测试检查后门可达性。

## 原文出处与已有面试题

- [[学习笔记/UVM/07-RAL寄存器模型与前后门访问#732-后门访问操作的定义-高|第 7 章 · 7.3.2 后门访问操作的定义（🔴 高）]]
- [[学习笔记/UVM/07-RAL寄存器模型与前后门访问#735-uvm-中后门访问操作接口-中|第 7 章 · 7.3.5 UVM 中后门访问操作接口（🟡 中）]]
- [[学习笔记/UVM/07-RAL寄存器模型与前后门访问#794-后门访问故障定位-低|第 7 章 · 7.9.4 后门访问故障定位（🟢 低）]]
