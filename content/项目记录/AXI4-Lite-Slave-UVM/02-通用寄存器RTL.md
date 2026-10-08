---
title: AXI4-Lite 02｜通用寄存器 RTL
description: 解读参数化地址映射、AW/W 缓存、WSTRB、SLVERR 和寄存器平铺输出
date: 2026-10-08
updated: 2026-10-08
tags: [项目记录, AXI4-Lite, RTL, WSTRB, 寄存器]
draft: false
---

# 通用寄存器 RTL

返回 [[项目记录/AXI4-Lite-Slave-UVM/index|项目总览]]。

核心模块 `axi_lite_slave_regs` 把 AXI4-Lite 访问转换为寄存器数组读写。它用三个参数描述规模：

| 参数         | 默认值 | 含义                       |
| ------------ | -----: | -------------------------- |
| `DATA_WIDTH` |     32 | 每个寄存器和数据总线的位宽 |
| `ADDR_WIDTH` |      8 | 地址总线位宽               |
| `REG_COUNT`  |      8 | 寄存器数量                 |

`STRB_WIDTH = DATA_WIDTH / 8`，`ADDR_LSB = clog2(STRB_WIDTH)`。32 位数据总线每个寄存器占 4 字节，所以地址低 2 位用于 byte offset，`0x00/0x04/0x08` 分别映射到寄存器 0/1/2。

## AW/W 分别缓存，统一提交

DUT 用 `awaddr_hold` 保存先到的写地址，用 `wdata_hold/wstrb_hold` 保存先到的写数据。组合逻辑在已缓存值和当前总线值之间选择：

```systemverilog
wire [ADDR_WIDTH-1:0] write_addr =
    awaddr_valid ? awaddr_hold : s_axi_awaddr;
wire [DATA_WIDTH-1:0] write_data =
    wdata_valid ? wdata_hold : s_axi_wdata;
```

当地址和数据两部分同时齐备，`write_fire` 只触发一次，更新寄存器并拉高 `BVALID`。这样同时覆盖三种情况：

- AW 先到，W 后到；
- W 先到，AW 后到；
- AW/W 同一周期到达。

> [!note] 为什么判断 `!s_axi_bvalid`
> 当前设计只允许一笔未完成写事务。在 master 接受上一笔 B 响应前，不应再次修改寄存器或覆盖响应。

## 地址合法性

合法访问必须同时满足对齐和范围要求：

```systemverilog
write_addr_aligned = write_addr[ADDR_LSB-1:0] == '0;
write_addr_valid   = write_addr_aligned &&
                     (write_word_addr < REG_COUNT);
```

例如当前 UVM 实例 `REG_COUNT=4`：

| 地址   | 判断                 | 结果           |
| ------ | -------------------- | -------------- |
| `0x00` | 对齐，word address 0 | 寄存器 0，OKAY |
| `0x0C` | 对齐，word address 3 | 寄存器 3，OKAY |
| `0x01` | 未按 4 字节对齐      | SLVERR         |
| `0x10` | word address 4，越界 | SLVERR         |

非法写不修改寄存器并返回 `BRESP=SLVERR`；非法读返回零数据和 `RRESP=SLVERR`。

## WSTRB 如何实现部分写

32 位总线的 `WSTRB[3:0]` 分别控制四个 byte lane。DUT 逐字节更新：

```systemverilog
for (b = 0; b < STRB_WIDTH; b = b + 1)
  if (write_strb[b])
    regs[write_word_addr][b*8 +: 8] <=
      write_data[b*8 +: 8];
```

假设原值为 `32'h1234_5678`，写数据为 `32'hABCD_EF00`：

| WSTRB     | 被更新字节 | 新值        |
| --------- | ---------- | ----------- |
| `4'b0000` | 无         | `1234_5678` |
| `4'b0001` | `[7:0]`    | `1234_5600` |
| `4'b1100` | `[31:16]`  | `ABCD_5678` |
| `4'b1111` | 全部       | `ABCD_EF00` |

这也是 scoreboard 不能简单执行 `mirror[index] = data` 的原因：预测模型必须使用同一笔事务的 strobe，只更新被选中的字节。

## 读响应与响应保持

`AR` 握手时，DUT立即锁定对应的读数据和响应并拉高 `RVALID`。如果 master 暂时不给 `RREADY`，这些寄存器保持不变；握手完成后才清除 `RVALID`。

由于 `ARREADY = !RVALID`，上一笔读响应尚未结束时不会接收新地址。这避免了额外队列，但限制为单 outstanding read。

## regs_flat 的作用

内部 `regs` 是 unpacked array，`regs_flat` 用 generate 循环把所有寄存器拼成一条 packed vector：

```systemverilog
assign regs_flat[g*DATA_WIDTH +: DATA_WIDTH] = regs[g];
```

上层逻辑可以通过固定切片取得寄存器值，也便于波形观察。它适合通用寄存器 bank；当寄存器具有 RO、W1C 或硬件置位等独立行为时，应使用专用 CSR 逻辑。

## 参数化边界

> [!warning] DATA_WIDTH 的隐含约束
> 代码假设数据宽度可按字节划分，并通过 `clog2(DATA_WIDTH/8)` 计算地址低位。实际复用时应约束 `DATA_WIDTH` 为 8 的倍数，通常还应选 2 的幂，否则对齐和地址切片需要重新审查。

此外，RTL 的参数化程度高于当前 UVM 环境。后者仍在若干位置假定 32 位数据、4 字节对齐和 4 个寄存器。

## 面试复述要点

- AW/W 是独立通道，所以各用一组 valid/hold 寄存器缓存。
- `write_fire` 表示完整写事务已收齐，不等同于任意一个通道握手。
- WSTRB 必须逐 byte lane 合并，未选中字节保持原值。
- B/R 响应在 backpressure 下保持稳定，当前每个方向只支持一笔 outstanding。

上一篇：[[项目记录/AXI4-Lite-Slave-UVM/01-协议与握手|协议与握手]]。下一篇：[[项目记录/AXI4-Lite-Slave-UVM/03-项目寄存器与RW1C|项目寄存器与 RW1C]]。
