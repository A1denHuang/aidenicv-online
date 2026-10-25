---
title: UVM 学习笔记
description: 按章节顺序学习 UVM 验证平台、配置、通信、调度、激励、寄存器模型与复用
date: 2026-10-18
updated: 2026-10-25
tags: [学习笔记, UVM, IC验证]
draft: false
---

本栏目引用 qingxuanxx 的 UVM 学习笔记，按“章节序号 · 主要知识点”命名。建议从第 1 章开始，依次学习第 2～9 章；熟悉基础后可结合面试八股复习。

## 按知识网络复习

- [[知识卡片/UVM/index|UVM 知识网络 · 33 张卡片]]：按概念跳转，串联平台、配置通信、运行激励和寄存器复用；章节正文中的概念链接可随时进入对应卡片。

## 按章节学习

- [[学习笔记/UVM/01-UVM概念与验证方法学|第 1 章 · UVM 概念与验证方法学]]：UVM 的作用、验证流程、方法学分层与学习路线。
- [[学习笔记/UVM/02-验证平台搭建与测试用例|第 2 章 · 验证平台搭建与测试用例]]：driver、monitor、agent、scoreboard、sequence 与测试用例的协作。
- [[学习笔记/UVM/03-组件层次与config_db配置|第 3 章 · 组件层次与 config_db 配置]]：component 与 object、树形结构、field automation、日志与配置传递。
- [[学习笔记/UVM/04-TLM通信与端口连接|第 4 章 · TLM 通信与端口连接]]：TLM1.0、port、export、imp、analysis 与 FIFO 通信。
- [[学习笔记/UVM/05-Phase调度与Objection控制|第 5 章 · Phase 调度与 Objection 控制]]：phase 执行顺序、objection 生命周期与 domain 应用。
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手|第 6 章 · Sequence 激励与 Sequencer 握手]]：sequence 仲裁、激励宏、virtual sequence、response 与握手流程。
- [[学习笔记/UVM/07-RAL寄存器模型与前后门访问|第 7 章 · RAL 寄存器模型与前后门访问]]：寄存器模型、adapter、predictor、前后门访问与工程建模。
- [[学习笔记/UVM/08-Factory注册与类型覆盖|第 8 章 · Factory 注册与类型覆盖]]：factory 注册、type override、instance override、实现与调试。
- [[学习笔记/UVM/09-Callback回调与平台复用|第 9 章 · Callback 回调与平台复用]]：callback、模块化、参数化类及模块级到芯片级的验证平台复用。

## 面试复习

- [[学习笔记/UVM/面试八股|UVM 面试八股]]：原仓库的面试问答整理。

## 来源与许可

- 作者与仓库：[qingxuanxx/sv_uvm_axi_notes](https://github.com/qingxuanxx/sv_uvm_axi_notes/tree/aa3213b945751c9bde2fd2b013ea7fe9bf02fe22/uvm%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0)。
- 原文起点：[UVM 第 1 章学习笔记](https://github.com/qingxuanxx/sv_uvm_axi_notes/blob/aa3213b945751c9bde2fd2b013ea7fe9bf02fe22/uvm%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/uvm_ch1%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0.md)。
- 引用版本：`aa3213b945751c9bde2fd2b013ea7fe9bf02fe22`，整理日期：2026-10-18。
- Copyright (c) 2026 qingxuanxx；随栏目附上完整 [MIT 许可证](../../assets/uvm-notes-LICENSE.txt)。
- 保留原笔记正文、示例与章内编号，调整网站标题及导航；代码示例是否适用于具体仿真环境，请结合所用 UVM 版本判断。

[[学习笔记/index|返回学习笔记]] · [[学习笔记/SystemVerilog/学习笔记/index|SystemVerilog 配套笔记]]
