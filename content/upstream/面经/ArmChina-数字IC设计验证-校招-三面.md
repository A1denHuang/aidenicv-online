# Arm China 设计验证 三面面经（base 上海，50 分钟）

> 来源：小红书汇总帖 | 岗位：design verification，线上面试，面试官深耕 CPU 领域、提问细致。

## 开场

- 项目介绍，PPT 框图讲解项目

## AXI 方向

- DUT 架构说明
- w 通道不支持乱序的原因
- w 通道是否可以早于 aw 传输
- 各通道 feature
- interleaving 验证方法
- VIP 配置 outstanding 的方式

## RISC-V 方向

- CPU 微架构
- 数据冒险与控制冒险以及对应的解决方案

## 八股部分

- 蕴含和非交叠蕴含
- virtual sequence 和 sequence 区别
- task 和 function 区别
