---
title: AXI4-Lite 05｜激励、专项测试与 Scoreboard
description: 从约束随机事务到参考寄存器 mirror，建立可定位的端到端检查
date: 2026-10-08
updated: 2026-10-08
tags: [项目记录, AXI4-Lite, UVM, sequence, scoreboard]
draft: false
---

# 激励、专项测试与 Scoreboard

返回 [[项目记录/AXI4-Lite-Slave-UVM/index|项目总览]]。

验证不能只追求“随机得多”。本项目把可读的定向意图与大样本随机探索组合起来，再由同一 scoreboard 检查所有 monitor transaction。

## transaction 约束

随机 item 对地址和 WSTRB 使用权重分布：

- 地址 `0x00–0x0F` 权重 70，覆盖 4 个合法 word address 及其中的非对齐地址；
- `0x10–0x1F` 权重 15，覆盖靠近边界的越界地址；
- `0x20–0xFF` 权重 15，覆盖更广的越界空间；
- WSTRB 偏向 full write，同时保留 zero、single-byte 和部分 multi-byte 模式。

随机约束负责扩大搜索空间，专项 sequence 则保证关键场景确定出现。

## 五类 UVM 测试

| 测试                | 主要目的                                    | 当前每次典型事务数 |
| ------------------- | ------------------------------------------- | -----------------: |
| `smoke_test`        | 基本读写、部分写、非法与非对齐地址          |                 13 |
| `random_test`       | 命令、数据、地址和 strobe 的约束随机组合    |                500 |
| `wstrb_test`        | 10 种明确的 byte-enable 模式及读回          |                 20 |
| `error_test`        | 多组未对齐/越界地址，再确认合法访问未受污染 |                 20 |
| `backpressure_test` | 随机事务加更长 B/R ready 延迟               |                100 |

> [!note] 测试名不是覆盖证明
> `wstrb_test` 只列出 10 种模式，而 4 位 WSTRB 一共有 16 种；是否覆盖完整必须看 covergroup bins 和合并报告，不能仅凭名称判断。

## reference mirror 如何工作

scoreboard 内部维护：

```systemverilog
bit [AXI_DATA_WIDTH-1:0] mirror [AXI_REG_COUNT];
```

复位后全部为 0。每笔合法写根据 WSTRB 更新对应 byte；每笔合法读把 `rdata` 与 mirror 比较。非法写只检查 `SLVERR`，不更新 mirror；非法读还要求返回数据为 0。

这种模型没有读取 DUT 内部 `regs`，因此是独立的外部预测器。检查路径为：

```text
observed write → update expected mirror
observed read  → compare actual rdata with expected mirror
```

## 为什么检查 response 和 data 要分开

合法读可能出现两类独立错误：

1. 数据正确但 `RRESP` 错误；
2. `RRESP=OKAY` 但数据错误。

scoreboard 分别报告它们，失败日志能直接区分协议响应生成和寄存器内容更新问题。非法读同样同时检查 `SLVERR` 和零数据。

## scoreboard 也可能有 bug

> [!warning] 独立不等于绝对正确
> 当前 model 的 `word_addr = tr.addr >> 2`、`addr[1:0]` 都固定假设 32 位数据宽度。如果 DUT 改成 64 位而 UVM 不改，RTL 和 scoreboard 对同一地址的解释会不同。

验证参考模型应尽量从规格推导，并对模型本身做小规模定向测试。还可以把地址位移改为 `$clog2(AXI_DATA_WIDTH/8)`，把 WSTRB bins 按宽度生成，使参数化真正贯穿环境。

## 适合补充的负向验证

- driver 故意违反 payload 稳定规则，确认对应 SVA 能报错；
- DUT fault injection：破坏某个 byte lane，确认 scoreboard 报数据不匹配；
- 让非法写错误地更新寄存器，再读回确认 reference mirror 能发现污染；
- 在 reset 中途插入访问，明确环境与 DUT 的 reset-abort 策略。

这些实验验证的是“检查器真的会失败”，不是增加普通 PASS 数。

## 自测

1. 为什么 monitor 应在 B/R handshake 后才发布完整 transaction？
2. `WSTRB=0` 的合法写，response 和寄存器值分别应该怎样？
3. 随机测试出现 10,000 笔合法读写，是否能代替 error sequence？

答案要点：response 是完整观察的一部分；返回 OKAY 但寄存器不变；不能保证随机流一定命中需要的错误分类和边界。

上一篇：[[项目记录/AXI4-Lite-Slave-UVM/04-UVM平台架构|UVM 平台架构]]。下一篇：[[项目记录/AXI4-Lite-Slave-UVM/06-SVA协议检查|SVA 协议检查]]。
