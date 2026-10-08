---
title: AXI4-Lite 04｜UVM 平台架构
description: 顺着 transaction 数据流理解 item、driver、monitor、analysis port、scoreboard 与 coverage
date: 2026-10-08
updated: 2026-10-08
tags: [项目记录, AXI4-Lite, UVM, testbench架构]
draft: false
---

# UVM 平台架构

返回 [[项目记录/AXI4-Lite-Slave-UVM/index|项目总览]]。

这个 UVM 环境的核心不是类的数量，而是把三条责任链拆开：激励负责“发什么”，driver 负责“怎么在引脚上发”，monitor 负责“总线上实际发生了什么”。检查器只相信 monitor 观察到的事务。

## 组件层次

```text
uvm_test_top
└── env
    ├── agent
    │   ├── sequencer
    │   ├── driver
    │   └── monitor ── analysis_port ──┬── scoreboard
    │                                  └── coverage
    ├── scoreboard
    └── coverage
```

顶层 `top_tb` 实例化时钟、复位、interface、DUT 和 assertions，再通过 `uvm_config_db` 把 virtual interface 交给 driver 与 monitor。

## transaction：把五通道压成一次操作

`axi_lite_item` 保存：

- 请求：`cmd/addr/data/wstrb`；
- 结果：`rdata/resp`；
- 地址分类方法：aligned、in range、legal 和 address kind。

sequence 不直接操作 `AWVALID` 等信号，而是产生这种高层对象。一个 write item 最终会经历 AW、W、B 三条通道；一个 read item会经历 AR、R 两条通道。

> [!note] 为什么响应也放在 item 里
> driver 在 B/R 握手时把 `resp` 或 `rdata` 写回当前 request，便于 sequence 或调试查看；真正的 scoreboard 输入仍来自 monitor 重新构造的独立 transaction。

## driver：协议执行器

driver 从 sequencer 获取 item，再用 pin-level 信号完成访问。写任务有三个随机延迟：

- `aw_delay`：何时发写地址；
- `w_delay`：何时发写数据；
- `b_delay`：何时拉高 `BREADY`。

AW 和 W 在 `fork...join` 中并发，因此能够自然产生地址先到、数据先到和接近同时到达的情况。每一路都保持 `VALID`，直到真实握手：

```systemverilog
do @(posedge vif.aclk);
while (!(vif.awvalid && vif.awready));
```

读任务同样分别随机延迟 AR 发起和 `RREADY`，从 master 侧制造响应背压。

## monitor：以握手为事实来源

monitor 同时运行 `collect_writes()` 与 `collect_reads()`。写 monitor 并发等待 AW 与 W 握手，将可能分开到达的地址、数据合并，然后等待 B 握手；读 monitor 等 AR 握手，再等 R 握手。

> [!important] monitor 不应复用 driver 的 request
> 如果 scoreboard 直接接收 driver 认为自己发出的对象，就可能漏掉 driver 时序错误、DUT 接收错误或接口连接错误。monitor 从接口重新采样，才能建立端到端检查。

## analysis port：一份观察，多种消费者

monitor 完成一笔 transaction 后调用：

```systemverilog
ap.write(tr);
```

environment 将同一个 analysis port 同时连接到 scoreboard 和 coverage。二者不需要相互调用：

- scoreboard 判断结果是否正确；
- coverage 记录场景是否出现。

这是 TLM 广播的价值：以后增加 transaction logger 或性能统计器时，不必修改 monitor 的采样逻辑。

## factory 与 config_db 各解决什么

- `type_id::create()` 通过 factory 创建组件或 object，为后续 override 保留入口。
- `uvm_config_db` 把 top 中的实际 interface 句柄传入类世界，也用于覆盖 driver 的 `max_ready_delay`。
- `uvm_component_utils` 注册有层次生命周期的 component；`uvm_object_utils` 注册 item 和 sequence 这类 object。

## 当前架构的取舍

agent 固定为 active，没有 `is_active` 配置；scoreboard 用单个 analysis implementation 接收已完成事务；DUT 每个方向只支持单 outstanding，所以不需要复杂的 request queue 或 ID 匹配。

如果未来验证支持并发 outstanding 或完整 AXI4，需要让 monitor 保存未完成事务、按 ID/顺序关联 response，scoreboard 也要从单一 mirror 回调升级为可处理并发的预测队列。

## 面试复述要点

> sequence 决定事务内容，driver 把事务转换成 AXI 时序，monitor 只根据 `VALID && READY` 重建真实事务，再通过 analysis port 同时广播给 scoreboard 和 coverage。这样 stimulus、observation、checking 和 measurement 相互解耦。

上一篇：[[项目记录/AXI4-Lite-Slave-UVM/03-项目寄存器与RW1C|项目寄存器与 RW1C]]。下一篇：[[项目记录/AXI4-Lite-Slave-UVM/05-激励与Scoreboard|激励与 Scoreboard]]。
