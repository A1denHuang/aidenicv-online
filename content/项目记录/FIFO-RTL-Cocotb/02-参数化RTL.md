---
title: FIFO 02｜参数化 RTL、指针与状态标志
description: 解读数据宽度、深度、clog2、显式回绕和 occupancy flags
date: 2026-10-09
updated: 2026-10-09
tags: [项目记录, FIFO, Verilog, RTL, 参数化设计]
draft: false
---

# 参数化 RTL、指针与状态标志

返回 [[项目记录/FIFO-RTL-Cocotb/index|项目总览]]。

`sync_fifo` 暴露三个参数：

| 参数                    |    默认值 | 含义                       |
| ----------------------- | --------: | -------------------------- |
| `DATA_WIDTH`            |         8 | 每项数据位宽               |
| `DEPTH`                 |        16 | 可保存的数据项数           |
| `ALMOST_FULL_THRESHOLD` | `DEPTH-2` | almost-full 起始 occupancy |

当前 Makefile 显式使用 8、16、14，与 Python reference model 中的常量一致。

## 地址宽度与计数宽度不同

```verilog
localparam ADDR_WIDTH = clog2(DEPTH);
localparam COUNT_WIDTH = clog2(DEPTH + 1);
```

深度 16 时，地址只需表示 0–15，所以 `ADDR_WIDTH=4`；count 必须表示 0–16，共 17 种状态，所以 `COUNT_WIDTH=5`。

如果误把 count 也做成 4 位，它无法表示 16，full 判断永远不会正确成立。

## 手写 clog2

项目用 Verilog function 计算 ceiling log2，而不是 SystemVerilog `$clog2`：

```verilog
for (i = value - 1; i > 0; i = i >> 1)
    clog2 = clog2 + 1;
```

这种写法提升了旧工具兼容性。对于非 2 的幂深度，例如 DEPTH=10，地址宽度为 4，可以表示 0–15；RTL 通过显式比较 `DEPTH-1`，避免指针进入 10–15 的无效地址。

## 写与读的接受条件

```verilog
assign read_ok  = rd_en && !empty;
assign write_ok = wr_en && (!full || read_ok);
```

读接受条件简单：有请求且非空。写接受条件多了 `read_ok`，允许 full 时同拍读出一项并写入一项，occupancy 保持满而不损失吞吐。

## 时序更新

复位为异步低有效：`negedge rst_n` 会立即把指针、count 和 `dout` 清零。memory 没有清零，因为 count=0 已表示其中没有有效数据；逐项复位 memory 会增加硬件开销，也可能影响 RAM 推断。

正常周期分别处理读写，再按 `{write_ok, read_ok}` 更新 count：

| write_ok | read_ok | count |
| -------: | ------: | ----- |
|        0 |       0 | 保持  |
|        0 |       1 | 减 1  |
|        1 |       0 | 加 1  |
|        1 |       1 | 保持  |

读写指针只在相应操作真正被接受时移动，因此 overflow/underflow 请求不会破坏位置状态。

## 参数化的真实边界

> [!warning] `DEPTH=1` 当前不合法
> `clog2(1)` 返回 0，进而产生零宽指针声明。实现至少应要求 `DEPTH>=2`，并通过 elaboration-time check 明确报错。

还应约束：

- `DATA_WIDTH >= 1`；
- `0 <= ALMOST_FULL_THRESHOLD <= DEPTH`；
- Python 常量和 Makefile 参数必须同步；
- 若要声称支持任意深度，需要在 CI 中实际运行多个 2 的幂与非 2 的幂配置。

## 常见误区

- RTL 有 parameter 不等于所有参数值都合法或经过验证。
- memory 不复位不代表 FIFO 复位不完整；有效性由 count 管理。
- almost-full 使用 `>=`，跨过阈值后会一直保持到 occupancy 降低。
- 对非 2 的幂深度，不能依靠自然溢出回绕，必须显式判断末地址。

## 自测

1. DEPTH=10 时 ADDR_WIDTH 与 COUNT_WIDTH 分别是多少？
2. 为什么 full 时 `rd_en=1` 能使同拍 write 合法？
3. memory 不清零时，复位后为什么仍不会合法读出旧数据？

答案要点：4 和 4；读释放一个位置；count=0 使 `read_ok=0`。

上一篇：[[项目记录/FIFO-RTL-Cocotb/01-FIFO基础与循环缓冲区|FIFO 基础]]。下一篇：[[项目记录/FIFO-RTL-Cocotb/03-边界与并发语义|边界与并发语义]]。
