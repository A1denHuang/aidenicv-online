---
title: FIFO 01｜先进先出与循环缓冲区
description: 从队列规格理解 memory、读写指针、occupancy 和同步 FIFO
date: 2026-10-09
updated: 2026-10-09
tags: [项目记录, FIFO, 数字电路, 循环缓冲区]
draft: false
---

# 先进先出与循环缓冲区

返回 [[项目记录/FIFO-RTL-Cocotb/index|项目总览]]。

FIFO 是 First-In First-Out：最早写入的数据必须最早读出。它常用于吸收模块间短期速率差、隔离流水线阶段，或在数据通路和控制通路之间排队。

## 同步 FIFO 的接口

本项目只有一个 `clk`，读写都在同一时钟域完成，因此是同步 FIFO：

| 信号          | 方向 | 作用                   |
| ------------- | ---- | ---------------------- |
| `wr_en/din`   | 输入 | 请求写入一项数据       |
| `rd_en`       | 输入 | 请求读出队首数据       |
| `dout`        | 输出 | 最近一次有效读取的数据 |
| `empty`       | 输出 | 当前没有可读数据       |
| `full`        | 输出 | 当前没有空余位置       |
| `almost_full` | 输出 | occupancy 达到预警阈值 |

`wr_en` 和 `rd_en` 是请求，不代表操作一定发生。FIFO 满时普通写请求会被拒绝，空时读请求也会被拒绝。

## 三个状态量

RTL 用三个核心状态表示队列：

```verilog
reg [DATA_WIDTH-1:0] mem [0:DEPTH-1];
reg [ADDR_WIDTH-1:0] wr_ptr;
reg [ADDR_WIDTH-1:0] rd_ptr;
reg [COUNT_WIDTH-1:0] count;
```

- `mem` 存放数据。
- `wr_ptr` 指向下一次写入的位置。
- `rd_ptr` 指向下一次读取的位置。
- `count` 表示当前有效元素数量，也叫 occupancy。

读写指针只描述位置，本身不能始终区分空和满：循环一圈后两者可能再次相等。这个实现用额外的 `count` 消除歧义。

## 为什么叫循环缓冲区

指针到达最后一个存储位置后回到 0：

```verilog
if (wr_ptr == DEPTH - 1)
    wr_ptr <= 0;
else
    wr_ptr <= wr_ptr + 1'b1;
```

memory 的物理地址有限，但逻辑数据流可以持续前进。只要不在 full 时覆盖未读数据，指针回绕不会破坏先入先出顺序。

例如深度 4，先写 A/B/C，读出 A/B，再写 D/E。memory 中的数据位置已经回绕，但逻辑队列仍是 C/D/E；下一次读取必须得到 C。

## occupancy 决定状态

```verilog
assign empty = (count == 0);
assign full = (count == DEPTH);
assign almost_full = (count >= ALMOST_FULL_THRESHOLD);
```

almost-full 是上游流量控制的提前预警。它不阻止写入，真正决定是否还有容量的是 full。当前阈值 14，深度 16，所以 occupancy 从 14 开始拉高。

> [!note] `dout` 不是队首组合预览
> 当前 RTL 只有在有效读取的时钟沿才更新 `dout`。复位后为 0，空读时保持旧值。这不是 first-word fall-through FIFO。

## 常见误区

- 指针相等不一定表示 empty，也可能表示 full。
- almost-full 只是提示，不等于写请求会被拒绝。
- `wr_en=1` 不等于 memory 一定写入，要看 `write_ok`。
- 同步 FIFO 不解决跨时钟域问题；异步 FIFO 需要 Gray pointer 和同步器等另一套结构。

## 自测

1. 深度 4 的 FIFO 写入 A/B/C，读出 A，再写入 D/E，逻辑读取顺序是什么？
2. 为什么只用 `wr_ptr == rd_ptr` 无法同时定义 empty 与 full？
3. empty 时 `rd_en=1`，为什么不能把 `dout` 的旧值当成一次有效读取？

答案要点：B/C/D/E；指针回绕会产生相同关系；没有 `read_ok`，旧 `dout` 不代表新 transaction。

## 面试复述要点

> 这是单时钟同步 FIFO，memory 保存数据，读写指针形成 circular buffer，额外 count 区分空满并生成状态标志。数据只有在有效 read 时更新到 registered `dout`，不是 FWFT FIFO。

下一篇：[[项目记录/FIFO-RTL-Cocotb/02-参数化RTL|参数化 RTL]]。
