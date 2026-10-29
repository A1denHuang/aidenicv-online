# 第 37–43 周知识合集：可运行的机制检查

2026-10-30 实测环境：Questa Sim-64 10.7c、其预编译 UVM-1.1d；Icarus Verilog 13.0 stable。这些检查验证本文所述的小型语言机制，不代表重新运行上游项目或复现其性能数据。

在仓库根目录运行：

```powershell
./examples/weekly-digest-w37-43/run.ps1 -QuestaBin 'D:\Questasim\win64'
```

结果默认放在忽略目录 `.quartz/weekly-digest-check/`。脚本同时检查返回码、成功标记、fatal/UVM fatal 和覆盖率原始 bin 计数；Questa 在 `$fatal` 后也可能按 `quit -f` 返回 0，因此不能只检查退出码。

| 检查 | 实际结果 | 工具 / 文件 |
| --- | --- | --- |
| `at_least=4`，命中 3 / 4 / 5 次 | coverpoint、cross、实例汇总分别为 0% / 100% / 100% | Questa / `coverage.sv` |
| 单样本 `BUSY` | 三个 transition bin 均为 0 | Questa / `coverage.txt` |
| `IDLE BUSY` | `idle_to_busy` 为 1，其余为 0 | Questa / `coverage.txt` |
| `BUSY BUSY BUSY BUSY` | `busy_run` 为 2，其余为 0 | Questa / `coverage.txt` |
| `IDLE IDLE BUSY` | `idle_to_busy` 为 1，其余为 0 | Questa / `coverage.txt` |
| 互补的两个 covergroup 实例 | 默认类型覆盖率 50%；合并后类型覆盖率 100%；两个实例各 50% | Questa / `coverage.sv` |
| 多周期前件 + 析取后件 | 正向无误报；负向恰好触发 1 次 assertion action | Questa / `assertions.sv` |
| `disable iff` | 沿上复位、沿间复位均取消 pending attempt；复位释放后的负向用例恰好失败 1 次 | Questa / `assertions.sv` |
| `disable fork` 后已排队的 NBA | `q=1`，两款工具一致 | Questa + Icarus / `scheduling.sv` |
| `->>` | 等待方在 10 ns 被唤醒 | Questa / `scheduling.sv` |
| UVM drain time | 正确写法尾部 2 μs；错误写法尾部 42 μs，20 次 ready-to-end 回调；多花 40 μs | Questa + UVM-1.1d / `drain.sv` |

覆盖率比较显式设置 `option.per_instance = 1` 和 `option.get_inst_coverage = 1`。在本机 Questa 中，只设置前者时，开启 `merge_instances` 后 `get_inst_coverage()` 仍返回合并值 100%，而数据库实例报告为 50%。这是统计 API 配置差异，不能据此认定工具算错。

`drain.sv` 的 `set_drain_time` 参数按此环境的预编译 UVM 包时间单位 1 ps 换算；切换 UVM 构建时必须重新核实单位。该示例复现收尾机制和时间差，不是 OpenTitan 原环境的重跑。

Icarus 仅运行 `-DICARUS` 下的 NBA/fork 检查；covergroup、完整 SVA 和非阻塞事件检查使用 Questa。没有把未运行的 clocking block、RAL、Python/cocotb、parser 示例标为已验证。

断言负向用例使用计数型 action block 捕获预期失败，再用 `$fatal` 检查失败数。因此通过时不会在日志里产生意料之外的 assertion error。
