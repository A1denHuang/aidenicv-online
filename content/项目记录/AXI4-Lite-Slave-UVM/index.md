---
title: AXI4-Lite Slave IP 与 UVM 验证平台
description: 从五通道握手、寄存器 RTL 到 UVM、SVA、覆盖率和 51 次回归的完整项目复盘
date: 2026-10-08
updated: 2026-10-08
tags: [项目记录, AXI4-Lite, SystemVerilog, UVM, IC验证]
draft: false
---

# AXI4-Lite Slave IP 与 UVM 验证平台

这个项目实现了一个**可参数化 AXI4-Lite Slave 寄存器 IP**，并围绕它搭建了包含 constrained-random stimulus、scoreboard、functional coverage、SVA 和多种子回归的 UVM 验证环境。

配套源码：[AXI-Lite-Slave-IP-SystemVerilog-UVM](https://github.com/A1denHuang/AXI-Lite-Slave-IP-SystemVerilog-UVM)

> [!important] 项目验收基线
> 当前可复现实测结果为 50 次 UVM 回归加 1 次 directed bench，合计 **51/51 PASS**；检查 **10,543** 笔 AXI4-Lite 读写事务；UVM error/fatal 和 assertion failure 均为 0。合并功能覆盖率为 **82.14%**。这些结果说明当前验证计划下的用例全部通过，不等价于设计已被穷尽证明。

## 项目解决什么问题

SoC 中大量控制、状态和中断寄存器需要通过处理器总线访问。这个项目把问题分成两层：

1. RTL 层接收 AXI4-Lite 五个通道上的握手，完成地址检查、字节写入和响应返回。
2. 验证层从接口重新观察每笔事务，用独立 mirror 预测寄存器内容，再用覆盖率和断言检查“测过什么”和“协议是否被遵守”。

通用 DUT 默认支持 32 位数据、8 位地址和 8 个寄存器；当前 UVM 配置实例化为 32 位数据、8 位地址和 4 个寄存器。

## 数据与检查如何流动

| 路径 | 组件                          | 作用                                            |
| ---- | ----------------------------- | ----------------------------------------------- |
| 激励 | sequence → sequencer → driver | 生成 transaction，并转换成五通道 pin-level 握手 |
| 观察 | interface → monitor           | 只在真实握手点采样，重建完整读写 transaction    |
| 判分 | monitor → scoreboard          | 维护独立寄存器 mirror，检查 data 与 response    |
| 覆盖 | monitor → coverage            | 统计命令、地址类型、WSTRB、response 和交叉场景  |
| 协议 | interface → assertions        | 检查稳定性、响应先后、延迟、非法访问和复位行为  |

## 阅读路线

1. [[项目记录/AXI4-Lite-Slave-UVM/01-协议与握手|协议与握手]]：先建立五通道和 `VALID && READY` 的判断标准。
2. [[项目记录/AXI4-Lite-Slave-UVM/02-通用寄存器RTL|通用寄存器 RTL]]：理解 AW/W 分离到达、WSTRB 和错误响应。
3. [[项目记录/AXI4-Lite-Slave-UVM/03-项目寄存器与RW1C|项目寄存器与 RW1C]]：从通用 RAM 式寄存器走向真实 CSR 行为。
4. [[项目记录/AXI4-Lite-Slave-UVM/04-UVM平台架构|UVM 平台架构]]：顺着 transaction 数据流认识各组件职责。
5. [[项目记录/AXI4-Lite-Slave-UVM/05-激励与Scoreboard|激励与 Scoreboard]]：看随机约束、专项 sequence 和 reference mirror。
6. [[项目记录/AXI4-Lite-Slave-UVM/06-SVA协议检查|SVA 协议检查]]：区分端到端功能检查与逐周期协议检查。
7. [[项目记录/AXI4-Lite-Slave-UVM/07-覆盖率与回归复盘|覆盖率与回归复盘]]：读懂 51 次回归的证据、缺口和下一步。

## 项目亮点

- 写地址 AW 与写数据 W 可以同周期或分开到达，DUT 分别缓存后再组成完整写事务。
- WSTRB 按 byte lane 控制部分写，不会覆盖未选中的字节。
- 非对齐地址和越界地址统一返回 `SLVERR`。
- driver 主动制造 AW/W 到达顺序差异和 B/R ready 延迟，覆盖 backpressure。
- monitor 通过 analysis port 同时广播给 scoreboard 与 coverage，检查和统计互不耦合。
- 回归固定记录测试名、种子、事务数、UVM 错误数和覆盖率，结果可以复现而非只看一次 GUI 波形。

## 当前边界

> [!warning] 参数化并未贯穿整个验证平台
> 通用 RTL 用 `DATA_WIDTH/ADDR_WIDTH/REG_COUNT` 参数化，但 UVM item 和 scoreboard 中仍有 `addr[1:0]`、`addr >> 2`，coverage 也固定列举 32 位数据下的 4 个寄存器与 4 位 WSTRB。因此“RTL 可参数化”不等于“整个验证环境可无修改地验证任意宽度”。

项目还提供了带 CTRL、STATUS、INTR_EN、RW1C 中断状态和 VERSION 的专用寄存器模块，但 headline 覆盖率只针对实际实例化的通用 DUT。这个范围必须在简历或面试中说清楚。

## 一句话面试表达

> 我实现了一个支持 AW/W 解耦、WSTRB、地址错误响应和 backpressure 的 AXI4-Lite Slave Register IP，并用 UVM monitor 广播到 scoreboard 与 coverage，配合接口级 SVA 做 50 个种子回归；最终 51 次运行全部通过，功能覆盖率 82.14%，同时对未命中的 WSTRB 和不可能 cross bin 做了缺口分析。

## 延伸阅读

- [[学习笔记/SystemVerilog/基础语法|SystemVerilog 基础语法]]
