---
title: "UVM · sequence配置与sequencer句柄"
description: "sequence 从绑定的 sequencer 取得组件上下文；m_sequencer 为通用句柄，p_sequencer 为经声明和转换的具体句柄。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# sequence配置与sequencer句柄

[[知识卡片/UVM/index|返回知识网络总入口]] · 运行与激励

## 核心结论

sequence 从绑定的 sequencer 取得组件上下文；m_sequencer 为通用句柄，p_sequencer 为经声明和转换的具体句柄。

## 关键机制

- m_sequencer 提供基础能力，自定义字段要类型转换。
- uvm_declare_p_sequencer(my_sequencer) 要求实际启动类型兼容。
- config_db cntxt 要 component，可用 get_sequencer，或外部显式传配置。
- 用配置对象减少普通 sequence 对绝对 test 路径的依赖。

## 小例子或流程

```systemverilog
// body中，cfg为my_cfg，sqr为uvm_sequencer_base句柄
sqr = get_sequencer();
if (sqr == null) `uvm_fatal("NOSQR","sequencer missing")
if (!uvm_config_db#(my_cfg)::get(sqr,"","cfg",cfg))
  `uvm_fatal("NOCFG","sequence config missing")
```
外部 set 路径应覆盖该 sequencer。

## 易错点

- sequence 的 this 不能直接充当组件 cntxt。
- p_sequencer 类型不兼容会失败，不是任意强转。
- wait_modified 只等通知，仍需读取和同步协议。

## 关联知识

- [[知识卡片/UVM/10_config_db|config_db]]：sequence 借 sequencer 上下文取配置。
- [[知识卡片/UVM/18_sequence与sequencer|sequence与sequencer]]：绑定 sequencer 后获得类型与配置上下文。
- [[知识卡片/UVM/22_virtual_sequence|virtual_sequence]]：多接口编排需要正确的底层句柄。

## 原文出处与已有面试题

- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#644-p_sequencer-的使用-高|第 6 章 · 6.4.4 `p_sequencer` 的使用（🔴 高）]]
- [[学习笔记/UVM/06-Sequence激励与Sequencer握手#66-在-sequence-中使用-config_db-中|第 6 章 · 6.6 在 sequence 中使用 `config_db`（🟡 中）]]
- [[学习笔记/UVM/面试八股#25-m_sequencer-与-p_sequencer-的区别|八股 Q25 · m_sequencer 与 p_sequencer 的区别？]]
- [[学习笔记/UVM/面试八股#29-sequence-如何获取组件的配置config_db|八股 Q29 · sequence 如何获取组件的配置（config_db）？]]
