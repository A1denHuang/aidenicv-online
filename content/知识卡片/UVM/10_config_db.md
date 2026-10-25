---
title: "UVM · config、db"
description: "config_db 按参数化类型、路径和字段名查找配置，还需核对 set/get 时机及覆盖优先级。"
date: 2026-10-25
updated: 2026-10-25
tags: [知识卡片, UVM]
draft: false
---

# config_db

[[知识卡片/UVM/index|返回知识网络总入口]] · 配置与通信

## 核心结论

config_db 按参数化类型、路径和字段名查找配置，还需核对 set/get 时机及覆盖优先级。

## 关键机制

- set(cntxt,inst_name,field_name,value) 的上下文与路径共同决定范围，自取通常 get(this,"",key,value)。
- module 设置全路径用 null；sequence 借 sequencer 取得组件上下文。
- build 期间较高层上下文优先，同层后设置优先；build 后设置通常后写入优先。复杂组合用 +UVM_CONFIG_DB_TRACE 验证。
- 数值为值复制，对象为句柄共享：字段修改可被共享者看见，但替换源句柄不会自动重绑接收者。

## 小例子或流程

```systemverilog
// test中
uvm_config_db#(int)::set(this,"env.agt.drv","timeout_cycles",100);
// driver的build_phase中
if (!uvm_config_db#(int)::get(this,"","timeout_cycles",timeout_cycles))
  `uvm_fatal("CFG", "timeout_cycles missing")
```

## 易错点

- 变量名不决定路径，字符串拼错不会编译报错。
- 通配范围过宽易造成 agent 配置串用。
- 教材旧式 set/get_config 与自动字段配置有版本背景，这里以显式 config_db 为主。

## 关联知识

- [[知识卡片/UVM/03_组件树与实例路径|组件树与实例路径]]：配置通过组件上下文和路径定位。
- [[知识卡片/UVM/07_driver与virtual_interface|driver与virtual_interface]]：driver 从配置取得 vif 和协议参数。
- [[知识卡片/UVM/23_sequence配置与sequencer句柄|sequence配置与sequencer句柄]]：sequence 借 sequencer 上下文取配置。
- [[知识卡片/UVM/31_factory注册_创建与override|factory注册_创建与override]]：改参数与替换实现类型需要不同机制。
- [[知识卡片/UVM/33_参数化与平台复用|参数化与平台复用]]：配置对象减少固定层次耦合。
- [[知识卡片/UVM/11_report日志机制|report日志机制]]：配置 trace 和日志共同定位配置失败。

## 原文出处与已有面试题

- [[学习笔记/UVM/03-组件层次与config_db配置#352-set-与-get-函数的参数-高|第 3 章 · 3.5.2 set 与 get 函数的参数（🔴 高）]]
- [[学习笔记/UVM/03-组件层次与config_db配置#354-跨层次的多重设置-高|第 3 章 · 3.5.4 跨层次的多重设置（🔴 高）]]
- [[学习笔记/UVM/03-组件层次与config_db配置#355-同一层次的多重设置-高|第 3 章 · 3.5.5 同一层次的多重设置（🔴 高）]]
- [[学习笔记/UVM/03-组件层次与config_db配置#359-set_config-与-get_config-低|第 3 章 · 3.5.9 set_config 与 get_config（🟢 低）]]
- [[学习笔记/UVM/面试八股#6-config_db-完成-set-后若源变量发生变化get-到的值是否同步更新|八股 Q6 · config_db 完成 set 后，若源变量发生变化，get 到的值是否同步更新？]]
- [[学习笔记/UVM/面试八股#8-config_db-的四个参数是什么|八股 Q8 · config_db 的四个参数是什么？]]
- [[学习笔记/UVM/面试八股#10-多个组件对同一个配置-set最终谁生效|八股 Q10 · 多个组件对同一个配置 set，最终谁生效？]]
- [[学习笔记/UVM/面试八股#11-config_db-字段名前缀匹配agt_-的坑|八股 Q11 · config_db 字段名前缀匹配（agt_* 的坑）]]
- [[学习笔记/UVM/面试八股#12-config_db-的-setget-层级匹配规则|八股 Q12 · config_db 的 set/get 层级匹配规则]]
