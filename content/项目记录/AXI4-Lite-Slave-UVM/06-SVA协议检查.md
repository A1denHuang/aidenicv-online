---
title: AXI4-Lite 06｜SVA 协议检查
description: 用接口级断言检查 payload 稳定、响应顺序、延迟、非法地址与复位
date: 2026-10-08
updated: 2026-10-08
tags: [项目记录, AXI4-Lite, SVA, assertion, 协议检查]
draft: false
---

# SVA 协议检查

返回 [[项目记录/AXI4-Lite-Slave-UVM/index|项目总览]]。

scoreboard 在一笔事务完成后检查结果，SVA 则在每个周期检查通道规则。两者观察同一个接口，却回答不同问题：

- scoreboard：这次访问的 response 和 data 对不对？
- assertion：等待期间 payload 是否稳定、响应是否过早或永远不来？

## 接口级 checker

`axi_lite_slave_assertions` 只连接 AXI 信号，不读取 DUT 内部状态。这使它既能在 testbench 直接实例化，也有机会通过 `bind` 复用到其他 AXI4-Lite slave。

checker 内部维护少量历史状态：AW/W 是否已经分别出现、是否存在未完成写、是否存在未完成读。它用这些状态表达跨通道先后关系。

## 等待握手时保持稳定

典型 property：

```systemverilog
s_axi_wvalid && !s_axi_wready |=>
  s_axi_wvalid &&
  $stable(s_axi_wdata) &&
  $stable(s_axi_wstrb)
```

含义是：如果本周期 W 有效但未被接收，那么下一采样周期 `WVALID` 仍为 1，数据和 strobe 不变。AW、AR、B、R 也有对应稳定性检查。

这里的 `|=>` 是 non-overlapped implication，检查后件从下一采样点开始。property 是否需要 `|->` 或 `|=>` 必须结合采样边沿和待检查行为发生的周期决定。

## 响应不能凭空出现

- `BVALID` 上升前，AW 和 W 都必须已经握手或在当前事务中完成。
- `RVALID` 上升前，必须先有 AR handshake。
- `BRESP/RRESP` 只能使用当前设计支持的 OKAY 或 SLVERR。

这些检查能抓住 scoreboard 不容易定位的控制路径错误，例如 DUT 在只收到 AW 后就提前发出 B response。

## 有界活性

项目要求完整写事务或 AR handshake 后，在 `MAX_RESP_LATENCY=16` 周期内看到对应 `BVALID/RVALID`：

```systemverilog
write_complete |-> ##[0:MAX_RESP_LATENCY] s_axi_bvalid
```

这不是 AXI4-Lite 协议给出的统一固定延迟，而是本 checker 为避免仿真无限等待设置的项目级响应预算。复用到不同设计时，应按 microarchitecture 或验证需求配置。

## 非法地址响应

checker 用与当前配置一致的对齐和范围计算判断地址是否合法，并要求非法读写最终返回 SLVERR。它验证 response，不直接证明非法写没有改变寄存器；后者由后续读回加 scoreboard mirror 更适合检查。

## 复位与未知态

- 复位后检查 `BVALID/RVALID` 为 0，避免遗留旧响应。
- 复位释放后检查所有 VALID/READY 控制信号不存在 X/Z。
- 正常协议 property 使用 `disable iff (!aresetn)`，避免在 reset active 时产生无意义失败。

> [!warning] 断言的环境假设
> 稳定性 property 同时约束接口两侧。若 checker 用在 DUT 验证中，AW/W/AR 稳定性主要检查 master driver，B/R 稳定性主要检查 slave DUT。失败时要先判断责任属于 stimulus 还是设计。

## 当前断言的边界

- 它针对单 outstanding 实现，禁止在前一笔响应结束前接受第二笔同类请求；这比 AXI4-Lite 协议本身更具体，是当前 DUT 的结构约束。
- 断言覆盖报告为 0 failure，只说明回归中的行为没有触发失败；若要证明 checker 有效，应做反例注入。
- assertions 与 UVM item 都假设当前地址宽度和数据宽度配置一致，参数变化时需一起审查。

## 建议的反例注入

1. W 等待时改变 `WDATA`，应触发稳定性断言。
2. 只完成 AW 就强制 `BVALID`，应触发写响应先后断言。
3. 屏蔽正常 `RVALID` 超过 16 周期，应触发 latency assertion。
4. 让非法地址返回 OKAY，应触发 SLVERR assertion。

每次只注入一个错误，记录预期 assertion 名称和触发时间，再恢复正常 DUT 运行。这比笼统地说“加了 SVA”更有说服力。

## 面试复述要点

> scoreboard 做事务级端到端数据检查，SVA 做逐周期时序与协议检查。我的 checker 不依赖 DUT 内部信号，并用 AW/W 历史状态检查写响应必须在两个通道都完成后出现，同时对 backpressure 稳定性和 16 周期响应预算做约束。

上一篇：[[项目记录/AXI4-Lite-Slave-UVM/05-激励与Scoreboard|激励与 Scoreboard]]。下一篇：[[项目记录/AXI4-Lite-Slave-UVM/07-覆盖率与回归复盘|覆盖率与回归复盘]]。
