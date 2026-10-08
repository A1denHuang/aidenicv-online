---
title: 同步 FIFO RTL 与 Cocotb 验证
description: 从循环缓冲区、并发读写到 Python deque scoreboard 和 GitHub Actions 的项目复盘
date: 2026-10-09
updated: 2026-10-09
tags: [项目记录, FIFO, Verilog, Cocotb, Python, IC验证]
draft: false
---

# 同步 FIFO RTL 与 Cocotb 验证

这个项目实现了一个**参数化单时钟同步 FIFO**，并用 Cocotb 和 Python 建立自动检查环境。RTL 通过 memory、读写指针和 occupancy counter 保存数据；验证端用 Python `deque` 作为参考模型，覆盖复位、写满读空、almost-full 阈值、溢出保护、同周期读写和固定种子随机流。

配套源码：[FIFO-RTL-cocotb-cocotb-python](https://github.com/A1denHuang/FIFO-RTL-cocotb-cocotb-python)

> [!important] 当前可确认的验证基线
> 源码定义 5 个 Cocotb 测试，当前配置为 8-bit 数据、深度 16、almost-full threshold 14；提交 `388e6a7` 对应的 GitHub Actions regression 已成功完成。历史 CI 详细日志已过保留期，因此这里不虚构测试耗时、覆盖率或随机事务总数。

## 项目解决什么问题

FIFO 用来缓冲生产者与消费者之间暂时不一致的数据速率。这个项目把问题分成三层：

1. RTL 用循环地址保存先入数据，并保证先入先出。
2. Cocotb 用 Python coroutine 在时钟边沿驱动和观察 Verilog 信号。
3. Scoreboard 用独立 `deque` 预测每拍允许发生的读写，再自动比较数据和状态标志。

## 数据与检查如何流动

| 路径   | 组件                       | 作用                                      |
| ------ | -------------------------- | ----------------------------------------- |
| 激励   | Cocotb test → `FifoDriver` | 驱动 `wr_en/rd_en/din` 并执行复位         |
| 设计   | `sync_fifo`                | 更新 memory、指针、count、`dout` 与 flags |
| 观察   | `FifoMonitor`              | 读取 `dout/empty/full/almost_full`        |
| 预测   | `FifoScoreboard`           | 用 `deque` 保存期望顺序和 occupancy       |
| 判分   | `fifo_step()`              | 比较读数据并检查全部状态标志              |
| 自动化 | GitHub Actions             | 安装 Icarus 与 Cocotb 后运行 regression   |

## 阅读路线

1. [[项目记录/FIFO-RTL-Cocotb/01-FIFO基础与循环缓冲区|FIFO 基础与循环缓冲区]]：理解先进先出、指针和 occupancy。
2. [[项目记录/FIFO-RTL-Cocotb/02-参数化RTL|参数化 RTL]]：读懂宽度计算、回绕和 flags。
3. [[项目记录/FIFO-RTL-Cocotb/03-边界与并发语义|边界与并发语义]]：分析空读、满写和同拍读写。
4. [[项目记录/FIFO-RTL-Cocotb/04-Cocotb验证架构|Cocotb 验证架构]]：理解 coroutine、driver、monitor 和采样时机。
5. [[项目记录/FIFO-RTL-Cocotb/05-deque与Scoreboard|deque 与 Scoreboard]]：逐拍建立独立参考模型。
6. [[项目记录/FIFO-RTL-Cocotb/06-定向测试与随机回归|定向测试与随机回归]]：拆解 5 个测试和固定种子随机流。
7. [[项目记录/FIFO-RTL-Cocotb/07-CI与项目复盘|CI 与项目复盘]]：区分现有证据、验证缺口和下一步。

## 项目亮点

- 指针显式判断 `DEPTH-1` 后回绕，不要求深度必须是 2 的幂。
- `count` 同时驱动 empty、full 和 almost-full，状态定义集中且直观。
- 满状态同拍有效读取时仍允许写入，吞吐不必空出一个周期。
- `fifo_step()` 在驱动前先根据 reference queue 判断本拍哪些操作应被接受。
- `deque.append()` 与 `popleft()` 直接表达 FIFO 规格，参考模型短而可审查。
- 固定 Python 随机种子让失败序列可以重复，CI 则保证远端环境能自动运行。

## 当前边界

> [!warning] 参数化 RTL 不等于参数矩阵已经验证
> Makefile 与 Python 常量固定为 `DATA_WIDTH=8`、`DEPTH=16`、`ALMOST_FULL_THRESHOLD=14`。当前 CI 没有扫不同宽度、深度和阈值；`DEPTH=1` 还会让地址宽度计算为 0，threshold 也缺少合法范围检查。

当前项目没有 functional/code coverage、SVA、运行中复位、多种子回归或跨配置 regression。它是一个结构完整的入门验证项目，而不是已经封闭全部验证空间的 FIFO sign-off 环境。

## 一句话面试表达

> 我实现了一个参数化同步 FIFO，用 memory、循环读写指针和 count 管理 occupancy；验证端用 Cocotb 封装 driver、monitor 和逐拍检查函数，以 Python deque 作为独立 golden model，覆盖复位、满空边界、almost-full、同周期读写和固定种子随机流，并通过 GitHub Actions 自动运行 Icarus regression。

## 延伸阅读

- [[学习笔记/SystemVerilog/基础语法|SystemVerilog 基础语法]]
- [[项目记录/AXI4-Lite-Slave-UVM/04-UVM平台架构|AXI 项目的 UVM 平台架构]]：对比 Python/Cocotb 与 UVM 的职责拆分。
