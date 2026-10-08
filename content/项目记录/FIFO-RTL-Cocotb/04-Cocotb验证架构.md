---
title: FIFO 04｜Cocotb 与 Python 验证架构
description: 用 coroutine、Clock、Driver 和 Monitor 把 Python testbench 接到 Verilog DUT
date: 2026-10-09
updated: 2026-10-09
tags: [项目记录, FIFO, Cocotb, Python, testbench]
draft: false
---

# Cocotb 与 Python 验证架构

返回 [[项目记录/FIFO-RTL-Cocotb/index|项目总览]]。

Cocotb 让 Python coroutine 通过 simulator handle 读写 Verilog 信号。项目保留 driver、monitor、scoreboard 的职责拆分，但没有 UVM factory、phase 或 TLM 层次，适合用较少代码建立自动检查闭环。

## 测试环境如何启动

```python
cocotb.start_soon(Clock(dut.clk, 10, units="ns").start())
driver = FifoDriver(dut)
monitor = FifoMonitor(dut)
scoreboard = FifoScoreboard()
```

`Clock` coroutine 在后台产生 10 ns 周期时钟。`dut` 是 simulator 暴露的顶层句柄，Python 可以通过 `dut.wr_en.value` 等成员驱动或读取端口。

## Driver 的职责

`FifoDriver.reset()` 负责拉低异步复位、清除请求信号、等待 4 个上升沿，再释放复位。`cycle()` 把一次读写请求维持到下一个上升沿：

```python
self.dut.wr_en.value = int(wr_en)
self.dut.rd_en.value = int(rd_en)
self.dut.din.value = din & MASK
await RisingEdge(self.dut.clk)
await Timer(1, units="ps")
```

数据通过 `MASK` 截断到 8 位，避免 Python 任意精度整数超出 DUT 端口范围。

## 为什么上升沿后还等 1 ps

`RisingEdge` 唤醒 coroutine 时，RTL 的时序更新可能仍处于当前仿真时间槽的调度过程中。项目再等待 1 ps，让 nonblocking assignment 的结果可见，然后才由 monitor 读取 `dout` 和 flags。

> [!note] 更明确的采样方式
> 1 ps 延迟在当前 `timescale 1ns/1ps` 下可工作，但会把采样策略绑到时间精度。更稳健的 Cocotb 写法可使用 `ReadOnly()` 或合适的 phase trigger，明确进入只读稳定阶段。

## Monitor 的职责

Monitor 只封装输出读取：

```python
def flags(self):
    return {
        "empty": int(self.dut.empty.value),
        "full": int(self.dut.full.value),
        "almost_full": int(self.dut.almost_full.value),
    }
```

它不计算期望值，也不改变 DUT。当前 monitor 不是独立常驻 coroutine，而是在 `fifo_step()` 需要检查时同步取样，结构轻量但与测试流程耦合较紧。

## `async/await` 在这里表示什么

- `async def` 定义可暂停的 coroutine。
- `await RisingEdge(clk)` 把控制权交还 simulator，直到事件发生。
- `cocotb.start_soon()` 启动并发后台任务。
- 普通 Python 函数如 `flags()` 在当前仿真时间立即读取值，不推进时间。

这与 HDL 的并行硬件不同：Python coroutine 的执行顺序仍受 await 点和 simulator scheduler 控制。

## 与 UVM 的对应关系

| Cocotb 项目      | UVM 中近似角色                             |
| ---------------- | ------------------------------------------ |
| 测试函数         | test + sequence                            |
| `FifoDriver`     | driver                                     |
| `FifoMonitor`    | monitor                                    |
| `FifoScoreboard` | scoreboard/reference model                 |
| `fifo_step()`    | 一拍 stimulus + prediction + checking 流程 |
| Python `assert`  | 自动失败报告                               |

对应关系是验证思想上的，不表示 Cocotb 类必须模仿 UVM 类层次。小项目中过度框架化会降低可读性。

## 常见误区

- Python 赋值后不等待时钟，不能当作同步操作已经完成。
- 只等 `RisingEdge` 后立刻采样，可能遇到调度区竞态。
- Monitor 如果读取并修改 reference model，会混淆观察与预测职责。
- Cocotb 使用 Python 不代表可以忽略 HDL 时序语义。

## 自测

1. 为什么 driver 在驱动请求后必须等待上升沿？
2. 1 ps 延迟解决了什么问题，又带来什么依赖？
3. 当前 monitor 与后台持续采样 monitor 有什么区别？

答案要点：DUT 只在时钟沿采样；等待 NBA 更新但依赖 timescale；当前 monitor 由测试流程主动调用，不独立收集事务流。

上一篇：[[项目记录/FIFO-RTL-Cocotb/03-边界与并发语义|边界与并发语义]]。下一篇：[[项目记录/FIFO-RTL-Cocotb/05-deque与Scoreboard|deque 与 Scoreboard]]。
