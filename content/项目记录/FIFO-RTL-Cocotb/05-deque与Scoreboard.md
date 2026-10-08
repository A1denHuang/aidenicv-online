---
title: FIFO 05｜deque 参考模型与 Scoreboard
description: 在驱动前预测 accepted operation，并逐拍检查数据顺序和状态标志
date: 2026-10-09
updated: 2026-10-09
tags: [项目记录, FIFO, Python, deque, scoreboard]
draft: false
---

# deque 参考模型与 Scoreboard

返回 [[项目记录/FIFO-RTL-Cocotb/index|项目总览]]。

Python `collections.deque` 天然支持队尾追加和队首弹出，因此可以用极少代码表达 FIFO 的行为规格：写入 `append()`，读取 `popleft()`。

## reference queue

```python
self.expected = deque()
```

Scoreboard 不读取 DUT 内部 `mem/count/pointer`。它只根据测试请求和当前期望 occupancy 决定哪些操作应该被接受，再与 DUT 端口结果比较。这比直接窥视内部状态更接近端到端验证。

## 为什么要在驱动前预测

`fifo_step()` 先保存旧队列长度和队首：

```python
pre_len = len(scoreboard.expected)
read_expected = scoreboard.expected[0] if (rd_en and pre_len > 0) else None
write_accepted = wr_en and (pre_len < DEPTH or read_expected is not None)
```

接受条件必须基于**本拍时钟沿之前**的状态。若先修改 reference queue 再判断，就可能错误解释 empty/full 边界。

`read_expected` 同时表示本拍存在有效读。当 FIFO full 且有有效读时，`write_accepted` 仍为真，与 RTL 的 `!full || read_ok` 一致。

## 检查与更新顺序

驱动一拍后：

1. 若预期读有效，比较 `dout` 与旧队首；
2. 从 reference queue 弹出旧队首；
3. 若写被接受，把 `din` 追加到队尾；
4. 用新队列长度检查 empty/full/almost-full。

```python
if read_expected is not None:
    assert monitor.dout() == read_expected
    scoreboard.apply_read()

if write_accepted:
    scoreboard.apply_write(din)
```

这个顺序尤其适用于 full 时读写同地址：先验证读出旧元素，再把新元素加入逻辑队尾。

## flags 如何检查

```python
assert flags["empty"] == int(len(expected) == 0)
assert flags["full"] == int(len(expected) == DEPTH)
assert flags["almost_full"] == int(len(expected) >= THRESHOLD)
```

每一个 `fifo_step()` 都检查 flags，而不是只在 fill/drain 结束时检查。这样 count 如果中途偏离，失败会靠近根因周期。

## 独立模型与同源错误

deque 模型比复制 RTL 指针算法更独立：它从抽象队列规格出发，不需要模拟物理地址回绕。不过 reference model 和 DUT 仍可能共享同一个错误假设，例如双方都把 empty 同拍读写定义成只写。

> [!important] 边界语义要先写成规格
> Scoreboard 不是规格本身。empty/full 同拍行为、`dout` 保持方式和 almost-full 阈值必须先由需求决定，再分别实现到 RTL 与 model。

## 当前模型的参数化限制

Python 文件把 `DATA_WIDTH=8`、`DEPTH=16`、threshold 14 写成常量，Makefile 另有一份相同参数。两份配置如果漂移，scoreboard 会基于错误容量判分。

改进方法包括从环境变量统一传参、从 DUT 参数可见对象读取可验证配置，或由同一个 regression script 同时生成 simulator 参数和 Python 配置。

## 常见误区

- 满时所有写都拒绝：忽略同拍有效读释放的空间。
- 先 append 再取 read expected：会破坏 empty 同拍读写语义。
- 只检查数据不检查 flags：count 错误可能延迟很久才反映为数据错。
- reference model 复制 RTL 指针细节：两边更容易出现同源 bug。

## 自测

1. reference queue 满时同时读写，更新前后长度分别是多少？
2. 为什么 `read_expected` 要在 `driver.cycle()` 前保存？
3. 若 Makefile 把 DEPTH 改为 32，但 Python 仍为 16，会出现什么现象？

答案要点：都等于 DEPTH；需要旧队首和旧 occupancy；model 会过早认为 full 并产生错误预测。

## 面试复述要点

> Scoreboard 用 deque 表达抽象 FIFO 规格，每拍先根据旧 occupancy 预测 read/write acceptance，再驱动 DUT、比较旧队首、更新 reference queue，并检查所有 flags。这能覆盖满状态同拍替换等边界。

上一篇：[[项目记录/FIFO-RTL-Cocotb/04-Cocotb验证架构|Cocotb 验证架构]]。下一篇：[[项目记录/FIFO-RTL-Cocotb/06-定向测试与随机回归|定向测试与随机回归]]。
