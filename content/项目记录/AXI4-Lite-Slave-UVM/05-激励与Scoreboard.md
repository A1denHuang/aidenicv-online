---
title: AXI4-Lite 05｜激励、专项测试与 Scoreboard
description: 从约束随机事务到参考寄存器 mirror，建立可定位的端到端检查
date: 2026-10-08
updated: 2026-10-31
tags: [项目记录, AXI4-Lite, UVM, sequence, scoreboard]
draft: false
---

# 激励、专项测试与 Scoreboard

返回 [[项目记录/AXI4-Lite-Slave-UVM/index|项目总览]]。

验证不能只追求“随机得多”。本项目把可读的定向意图与大样本随机探索组合起来，再由同一 scoreboard 检查所有 monitor transaction。

## transaction 约束

随机 item 对地址和 WSTRB 使用权重分布。地址约束现在使用 `:/`，让 70/15/15 表示三个**整段**的目标比例：

```systemverilog
constraint c_addr_mix {
    addr dist {
        [8'h00:8'h0F] :/ 70,
        [8'h10:8'h1F] :/ 15,
        [8'h20:8'hFF] :/ 15
    };
}
```

这里有一个很容易在面试中被追问的区别：

- `:=` 把右侧权重赋给范围内的**每一个值**；
- `:/` 把右侧权重分摊给**整个范围**。

旧代码误用了 `:=`。三个范围包含的值分别为 16、16 和 224 个，因此总权重是 `16×70 + 16×15 + 224×15 = 4720`：

| 地址范围    | 旧写法下的总权重 | 旧写法下的理论比例 |
| ----------- | ---------------: | -----------------: |
| `0x00–0x0F` |     `16×70=1120` |          约 23.73% |
| `0x10–0x1F` |      `16×15=240` |           约 5.08% |
| `0x20–0xFF` |    `224×15=3360` |          约 71.19% |

项目只有 `0x00/0x04/0x08/0x0C` 四个合法地址。旧写法下它们合计权重为 `4×70=280`，所以合法地址理论占比只有 `280/4720≈5.93%`，而不是 70%。改成 `:/` 后，`0x00–0x0F` 整段占 70%；由于该段仍包含 12 个非对齐地址，四个合法地址合计理论占比是 `70%×4/16=17.5%`。

这次修正也说明：覆盖率回答的是目标 bin 是否被命中，不等于随机分布写得正确。旧约束虽然让越界地址占多数，合法地址的 coverage bin 仍然可以全部打满。

修正后以 seed `20261031` 跑 1000 笔 `axi_lite_random_test`，地址类别命中为 legal 187、unaligned 758、out-of-range 55；legal 实测 18.7%，与 17.5% 的理论目标相符。`cp_addr` 的 17 个 bin 和 `cp_addr_kind` 的 3 个 bin 都达到 100%，UVM error/fatal 为 0。单个 seed 的有限样本用于验证趋势与回归正确性，不代表每次都精确等于理论比例。

WSTRB 则继续使用按单值加权的 `:=`，偏向 full write，同时保留 zero、single-byte 和部分 multi-byte 模式；这里每个条目都是单值，语义符合预期。

> [!tip] 面试复述
> “我回看项目时发现地址 `dist` 使用 `:=`，它会给范围内每个值加权，导致 `0x20–0xFF` 约占 71%，合法地址只有约 6%。我把它改成 `:/`，让 70/15/15 真正表示三个范围的整体权重；同时也确认了 coverage bin 打满并不能证明激励概率合理。”

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
