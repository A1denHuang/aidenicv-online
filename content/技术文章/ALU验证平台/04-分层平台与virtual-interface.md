---
title: ALU 04｜driver、monitor、scoreboard 与 virtual interface
description: 分层职责、采样时序、参考模型和 virtual interface 语法
date: 2026-09-22
updated: 2026-09-22
tags: [SystemVerilog, ALU, virtual-interface, scoreboard, 教程]
draft: false
---

# driver、monitor、scoreboard 与 virtual interface

返回 [[技术文章/ALU验证平台/index|ALU 任务总览]]。

## 为什么拆层

顶层测试流程现在只协调组件：

~~~systemverilog
drv.drive(tr);
observed = mon.sample();
scb.check(tr, observed);
cov.op_cg.sample(tr.op);
drv.idle();
~~~

- **driver** 驱动输入，不算期望值。
- **monitor** 读取接口并创建观测快照，不驱动、不判分。
- **scoreboard** 按规格计算期望值并比较，维护通过／失败计数。
- **coverage** 记录见过的场景，不判正确性。
- **top** 管理时钟、复位、用例与组件调用顺序。

这是教学用的**顺序分层平台**，尚不是独立常驻线程＋队列通信的完整并行环境。

## 任务：理解 `virtual alu_if #(8) vif`

接口实例在 top 中，例如 `alu_if #(8) vif(clk);`。类不能像模块那样实例化实体接口，便通过一个 virtual interface 变量持有实际接口的引用：

~~~systemverilog
class alu_driver;
  virtual alu_if #(8) vif;

  function new(virtual alu_if #(8) vif);
    this.vif = vif;
    if (vif == null)
      $fatal(1, "alu_driver received a null interface");
  endfunction
endclass

// top 的 initial 中
drv = new(vif);
~~~

左边 `this.vif` 是 driver 成员；右边 `vif` 是构造参数；top 的 `vif` 是实际接口实例。三者同名但作用域不同。`virtual` 不创建或复制硬件接口，也不是此处的“虚函数”；它让类方法能通过句柄访问 `vif.req_valid`、`vif.result` 等信号。这里的参数化位宽 `#(8)` 要与实际接口匹配。

## 任务：在正确时刻驱动和采样

driver 在下降沿放好 `req_valid/op/a/b`，等待下一上升沿，再等教学用的 `#1`，让 DUT 非阻塞赋值完成：

~~~systemverilog
@(negedge vif.clk);
vif.req_valid = 1'b1;
vif.op = tr.op;
vif.a  = tr.a;
vif.b  = tr.b;
@(posedge vif.clk);
#1;
~~~

因此 top 随后调用 `mon.sample()` 时直接取快照，**不要再等一次上升沿**。`#1` 不是通用的竞态解决方案；后续更复杂协议应学习 clocking block 与调度区，并统一时间精度。

## 任务：让 scoreboard 独立判分

核心检查形式：

~~~systemverilog
expected = reference_model(sent.op, sent.a, sent.b);
if (observed.rsp_valid !== 1'b1) begin
  $error("Response is not valid");
  fail_count++;
end else if (observed.result !== expected) begin
  $error("Mismatch: expected=%0d actual=%0d", expected, observed.result);
  fail_count++;
end else begin
  pass_count++;
end
~~~

`!==` 会把 X/Z 也判为不符合已知期望。模型函数必须在 scoreboard 可见的作用域；不能因为 top 有同名函数，类就能直接调用。搬迁时 `WIDTH` 曾只定义在 top，类里不能直接使用它；当前各组件固定 8 位，**整个环境尚未完全参数化**。

`$display/$info` 用于信息，`$warning` 用于提醒，`$error` 报错后通常可继续，`$fatal` 适合空句柄等无法安全继续的错误，`$finish` 结束正常测试，`$stop` 用于交互暂停。`$fatal(1, "...")` 的 `1` 是诊断级别参数，不是失败次数。自定义 `fail_count` 仍需显式累加。

新增类文件后若仍提示找不到，先确认文件已保存、非 0 字节，package 已包含它、top 已声明句柄并调用 `new()`；“文件存在”不等于“对象已创建”。
