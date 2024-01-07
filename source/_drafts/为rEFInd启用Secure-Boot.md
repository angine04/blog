---
title: 为rEFInd启用Secure Boot
tags:
  - 折腾
  - Boot
  - EFI
  - rEFInd
post-index: true
categories: Dev
linkhash: '@@linkhash'
date: 2023-05-27 02:24:49
---

 > 不论如何，至少电脑没有变万元大砖头，可喜可贺！<span id="text-secret">其实不太可能变砖。</span>

 # 前因

笔者的设备是HP家的OMEN 17（更通行的名称是“暗影精灵8Plus高能版”）。自从安装了Windows+Ubuntu双系统，经常地，在电脑启动时会看到“**502：CMOS校验出现错误**”。正常启动倒是不受影响，但是之前花费力气装好的rEFInd引导器却不见了，取而代之的是grub的大黑框。

不论原因是什么，CMOS验证出现了错误，接下来便恢复默认值了。此前为了启用rEFInd，手动关掉了**安全启动（Secure Boot）**，这下也恢复成了默认的开启状态。UEFI拒绝加载rEFInd，便只好加载第二顺位的grub。虽然并不影响启动，但是着实膈应人。

 # Secure Boot是怎么一回事

 Secure Boot是微软整的一个安全机制，意在仅允许可信的操作系统启动


  